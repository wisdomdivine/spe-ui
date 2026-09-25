import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

// Revalidate every 30 seconds at the CDN / Edge layer
export const revalidate = 30;
export const maxDuration = 60;

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data: elections, error } = await supabase
      .from("guest_elections")
      .select("id, title, description, status, is_open, election_date, start_time, end_time, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!elections || elections.length === 0) {
      return NextResponse.json([]);
    }

    const enriched = await Promise.all(
      elections.map(async (e) => {
        const [positions, candidates, voters] = await Promise.all([
          supabase.from("guest_election_positions").select("id", { count: "exact", head: true }).eq("election_id", e.id),
          supabase.from("guest_election_candidates").select("id", { count: "exact", head: true }).eq("election_id", e.id),
          supabase.from("guest_election_voter_assignments").select("id", { count: "exact", head: true }).eq("election_id", e.id),
        ]);

        let votedCount = 0;
        const { data: firstPos } = await supabase
          .from("guest_election_positions")
          .select("id")
          .eq("election_id", e.id)
          .order("sort_order")
          .limit(1)
          .maybeSingle();

        if (firstPos?.id) {
          const { count } = await supabase
            .from("guest_election_ballots")
            .select("id", { count: "exact", head: true })
            .eq("election_id", e.id)
            .eq("position_id", firstPos.id);
          votedCount = count ?? 0;
        } else {
          const { count } = await supabase
            .from("guest_election_voter_assignments")
            .select("id", { count: "exact", head: true })
            .eq("election_id", e.id)
            .eq("has_voted", true);
          votedCount = count ?? 0;
        }

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          status: computeElectionStatus(e),
          is_open: e.is_open,
          election_date: e.election_date,
          start_time: e.start_time,
          end_time: e.end_time,
          positions_count: positions.count || 0,
          candidates_count: candidates.count || 0,
          voters_count: voters.count || 0,
          voted_count: votedCount,
        };
      })
    );

    return NextResponse.json(enriched, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch guest elections";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
