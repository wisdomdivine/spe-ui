import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest/elections/[id]/vote
 * Cast a ballot for guest elections - one candidate per position.
 *
 * Body: { voter_id: string, votes: Record<position_id, candidate_id | "__NONE_OF_ABOVE__"> }
 *
 * Uses atomic PostgreSQL RPC `submit_guest_election_ballot` with row-level locking (FOR UPDATE)
 * to eliminate double-voting and cut 6 network roundtrips down to 1.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json();
    const { voter_id, votes } = body as {
      voter_id: string;
      votes: Record<string, string | string[]>;
    };
    const NONE_OF_ABOVE_TOKEN = "__NONE_OF_ABOVE__";

    if (!voter_id || !votes || typeof votes !== "object") {
      return NextResponse.json(
        { error: "voter_id and votes are required." },
        { status: 400 }
      );
    }

    // Concurrency guard: prevents rapid double-click ballot submissions for the same voter
    const rl = await checkRateLimit(`guest_vote:${electionId}:${voter_id}`, 2, 15_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Your ballot is already being submitted. Please hold on..." },
        { status: 409 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch positions & candidates for server-side validation of multi-select min/max rules
    const [positionsRes, candidatesRes] = await Promise.all([
      supabase
        .from("guest_election_positions")
        .select("id, title, allow_multiple, min_selections, max_selections")
        .eq("election_id", electionId),
      supabase
        .from("guest_election_candidates")
        .select("id, position_id")
        .eq("election_id", electionId),
    ]);

    if (positionsRes.error || candidatesRes.error) {
      return NextResponse.json(
        { error: "Failed to verify election configuration. Please try again." },
        { status: 500 }
      );
    }

    const positions = positionsRes.data || [];
    const positionIds = new Set(positions.map((p) => p.id));
    const candidatesByPos = new Map<string, Set<string>>();
    for (const c of candidatesRes.data || []) {
      if (!candidatesByPos.has(c.position_id)) candidatesByPos.set(c.position_id, new Set());
      candidatesByPos.get(c.position_id)!.add(c.id);
    }

    for (const submittedPosId of Object.keys(votes)) {
      if (!positionIds.has(submittedPosId)) {
        return NextResponse.json({ error: "Ballot contains an invalid position." }, { status: 400 });
      }
    }

    // Validate & flatten selections into votePayload rows
    const votePayload: Array<{ position_id: string; candidate_id: string | null }> = [];
    for (const pos of positions) {
      const raw = votes[pos.id];
      const selectedList = Array.isArray(raw)
        ? raw.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        : typeof raw === "string" && raw.trim().length > 0
          ? [raw.trim()]
          : [];

      const hasVoid = selectedList.includes(NONE_OF_ABOVE_TOKEN);
      if (hasVoid) {
        if (selectedList.length > 1) {
          return NextResponse.json(
            { error: `Cannot combine Void with candidate selections for ${pos.title}.` },
            { status: 400 }
          );
        }
        votePayload.push({ position_id: pos.id, candidate_id: null });
        continue;
      }

      const unique = new Set(selectedList);
      if (unique.size !== selectedList.length) {
        return NextResponse.json(
          { error: `Duplicate candidate selected for ${pos.title}.` },
          { status: 400 }
        );
      }

      const validCands = candidatesByPos.get(pos.id) || new Set<string>();
      for (const cid of selectedList) {
        if (!validCands.has(cid)) {
          return NextResponse.json(
            { error: `Invalid candidate selected for ${pos.title}.` },
            { status: 400 }
          );
        }
      }

      if (!pos.allow_multiple) {
        if (selectedList.length !== 1) {
          return NextResponse.json(
            { error: `Please select exactly 1 option for ${pos.title}.` },
            { status: 400 }
          );
        }
      } else {
        const candCount = validCands.size;
        const rawMax = Math.max(1, pos.max_selections ?? 2);
        const effMax = candCount > 0 ? Math.min(rawMax, candCount) : rawMax;
        const effMin = Math.min(Math.max(0, pos.min_selections ?? 1), effMax);

        if (selectedList.length < effMin) {
          return NextResponse.json(
            { error: `Please select at least ${effMin} candidate${effMin !== 1 ? "s" : ""} for ${pos.title}.` },
            { status: 400 }
          );
        }
        if (selectedList.length > effMax) {
          return NextResponse.json(
            { error: `You can select at most ${effMax} candidate${effMax !== 1 ? "s" : ""} for ${pos.title}.` },
            { status: 400 }
          );
        }
      }

      for (const cid of selectedList) {
        votePayload.push({ position_id: pos.id, candidate_id: cid });
      }
    }

    // ── Exclusive Atomic RPC Submission (1 roundtrip + PostgreSQL FOR UPDATE row lock) ──
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("submit_guest_election_ballot", {
      p_election_id: electionId,
      p_voter_id: voter_id,
      p_votes: votePayload,
    });

    if (rpcErr) {
      console.error("Guest Ballot RPC error:", rpcErr);
      return NextResponse.json({ error: "Failed to record ballot. Please try again." }, { status: 500 });
    }

    const result = rpcRes as { success: boolean; error?: string };
    if (!result.success) {
      const status = result.error?.includes("already voted") ? 409 : 400;
      return NextResponse.json({ error: result.error || "Failed to submit ballot." }, { status });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
