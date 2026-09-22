import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/elections/[id]/vote
 * Cast a ballot - one candidate per position.
 *
 * Body: { voter_id: string, votes: Record<position_id, candidate_id | "__NONE_OF_ABOVE__"> }
 *
 * Uses atomic PostgreSQL RPC `submit_election_ballot` with row-level locking (FOR UPDATE)
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
      votes: Record<string, string>;
    };
    const NONE_OF_ABOVE_TOKEN = "__NONE_OF_ABOVE__";

    if (!voter_id || !votes || typeof votes !== "object") {
      return NextResponse.json(
        { error: "voter_id and votes are required." },
        { status: 400 }
      );
    }

    // Concurrency guard: prevents rapid double-click ballot submissions for the same voter
    const rl = await checkRateLimit(`vote:${electionId}:${voter_id}`, 2, 15_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Your ballot is already being submitted. Please hold on..." },
        { status: 409 }
      );
    }

    const supabase = getSupabaseServer();

    // Prepare vote payload
    const votePayload = Object.entries(votes).map(([position_id, candidate_id]) => ({
      position_id,
      candidate_id: candidate_id === NONE_OF_ABOVE_TOKEN ? null : candidate_id,
    }));

    // ── Attempt Atomic RPC Submission (1 roundtrip + row-level lock) ──
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("submit_election_ballot", {
        p_election_id: electionId,
        p_voter_id: voter_id,
        p_votes: votePayload,
      });

      if (!rpcErr && rpcRes) {
        const result = rpcRes as { success: boolean; error?: string };
        if (!result.success) {
          const status = result.error?.includes("already voted") ? 409 : 400;
          return NextResponse.json({ error: result.error || "Failed to submit ballot." }, { status });
        }
        return NextResponse.json({ success: true });
      }
    } catch {
      // Fall through to legacy flow if RPC is not yet created in Supabase
    }

    // ── Fallback Multi-Step Flow (if RPC not yet applied in DB) ──
    // 1. Fetch election + validate it's Live
    const { data: election, error: elErr } = await supabase
      .from("elections")
      .select("id, status, election_date, start_time, end_time, title, is_open")
      .eq("id", electionId)
      .single();

    if (elErr || !election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    if (!election.is_open) {
      return NextResponse.json(
        { error: "This election is not open for voting yet." },
        { status: 403 }
      );
    }

    const liveStatus = computeElectionStatus(election);
    if (liveStatus !== "Live") {
      return NextResponse.json(
        { error: `This election is ${liveStatus.toLowerCase()}. Voting is not available.` },
        { status: 403 }
      );
    }

    // 2. Check voter assignment + hasn't voted
    const { data: assignment, error: assignErr } = await supabase
      .from("election_voter_assignments")
      .select("id, has_voted")
      .eq("election_id", electionId)
      .eq("voter_id", voter_id)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json(
        { error: "You are not eligible to vote in this election." },
        { status: 403 }
      );
    }

    if (assignment.has_voted) {
      return NextResponse.json(
        { error: "You have already voted in this election." },
        { status: 409 }
      );
    }

    // 3. Validate all positions are covered
    const { data: positions } = await supabase
      .from("election_positions")
      .select("id")
      .eq("election_id", electionId);

    const positionIds = (positions || []).map((p) => p.id);
    const votedPositionIds = Object.keys(votes);

    for (const posId of positionIds) {
      if (!votedPositionIds.includes(posId) || !votes[posId]) {
        return NextResponse.json(
          { error: "You must vote for all positions." },
          { status: 400 }
        );
      }
    }

    // 4. Validate all candidates belong to their positions.
    // "__NONE_OF_ABOVE__" is a system option and maps to NULL candidate_id.
    const { data: candidates } = await supabase
      .from("election_candidates")
      .select("id, position_id")
      .eq("election_id", electionId);

    const candidateMap = new Map((candidates || []).map((c) => [c.id, c.position_id]));

    for (const [posId, candId] of Object.entries(votes)) {
      if (candId === NONE_OF_ABOVE_TOKEN) continue;
      if (candidateMap.get(candId) !== posId) {
        return NextResponse.json(
          { error: "Invalid candidate selection." },
          { status: 400 }
        );
      }
    }

    // 5. Insert anonymous votes (NO voter_id in election_votes)
    const voteRows = Object.entries(votes).map(([position_id, candidate_id]) => ({
      election_id: electionId,
      position_id,
      candidate_id: candidate_id === NONE_OF_ABOVE_TOKEN ? null : candidate_id,
    }));

    const { error: insertErr } = await supabase
      .from("election_votes")
      .insert(voteRows);

    if (insertErr) throw insertErr;

    // 6. Mark voter as has_voted
    const { error: updateErr } = await supabase
      .from("election_voter_assignments")
      .update({ has_voted: true, voted_at: new Date().toISOString() })
      .eq("id", assignment.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
