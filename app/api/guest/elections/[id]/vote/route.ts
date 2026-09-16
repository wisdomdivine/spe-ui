import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest/elections/[id]/vote
 * Cast a ballot for guest elections - one candidate per position.
 *
 * Body: { voter_id: string, votes: Record<position_id, candidate_id | "__NONE_OF_ABOVE__"> }
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

    const supabase = getSupabaseServer();

    // 1. Fetch election + validate it's open/Live
    const { data: election, error: elErr } = await supabase
      .from("guest_elections")
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
    if (liveStatus !== "Live" && election.status !== "Active" && !election.is_open) {
      return NextResponse.json(
        { error: `This election is ${liveStatus.toLowerCase()}. Voting is not available.` },
        { status: 403 }
      );
    }

    // 2. Check voter assignment + hasn't voted
    const { data: assignment, error: assignErr } = await supabase
      .from("guest_election_voter_assignments")
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
      .from("guest_election_positions")
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

    // 4. Validate all candidates belong to their positions
    const { data: candidates } = await supabase
      .from("guest_election_candidates")
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

    // 5. Insert anonymous votes into guest_election_ballots
    const voteRows = Object.entries(votes).map(([position_id, candidate_id]) => ({
      election_id: electionId,
      position_id,
      candidate_id: candidate_id === NONE_OF_ABOVE_TOKEN ? null : candidate_id,
    }));

    const { error: insertErr } = await supabase
      .from("guest_election_ballots")
      .insert(voteRows);

    if (insertErr) throw insertErr;

    // 6. Mark voter assignment as has_voted
    const { error: updateErr } = await supabase
      .from("guest_election_voter_assignments")
      .update({ has_voted: true, voted_at: new Date().toISOString() })
      .eq("id", assignment.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
