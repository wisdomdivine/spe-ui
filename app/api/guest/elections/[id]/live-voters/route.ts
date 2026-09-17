import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/guest/elections/[id]/live-voters
 * Returns the most recent guest voters (name + time) for the VotingCrowd sidebar.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const supabase = getSupabaseServer();

    const { data: electionMeta } = await supabase
      .from("guest_elections")
      .select("show_live_voter_names")
      .eq("id", electionId)
      .single();
    const showLiveVoterNames = electionMeta?.show_live_voter_names !== false;

    // Fetch recent voters who have voted, joined with guest voter names
    const { data, error } = await supabase
      .from("guest_election_voter_assignments")
      .select("voter_id, voted_at, guest_voters(id, name)")
      .eq("election_id", electionId)
      .eq("has_voted", true)
      .order("voted_at", { ascending: false, nullsFirst: false })
      .limit(20);

    if (error) throw error;

    // Also get total voted count
    const { count } = await supabase
      .from("guest_election_voter_assignments")
      .select("id", { count: "exact", head: true })
      .eq("election_id", electionId)
      .eq("has_voted", true);

    const voters = (data || []).map((d) => {
      const voter = d.guest_voters as unknown as { id: string; name: string } | null;
      return {
        voter_id: d.voter_id,
        name: showLiveVoterNames ? (voter?.name || "Guest Voter") : "Anonymous",
        voted_at: d.voted_at,
      };
    });

    return NextResponse.json({
      total_voted: count || 0,
      show_live_voter_names: showLiveVoterNames,
      recent_voters: voters,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch live guest voters";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
