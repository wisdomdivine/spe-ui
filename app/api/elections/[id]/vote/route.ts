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

    // ── Exclusive Atomic RPC Submission (1 roundtrip + PostgreSQL FOR UPDATE row lock) ──
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("submit_election_ballot", {
      p_election_id: electionId,
      p_voter_id: voter_id,
      p_votes: votePayload,
    });

    if (rpcErr) {
      console.error("Ballot RPC error:", rpcErr);
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
