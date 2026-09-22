import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

export const dynamic = "force-dynamic";
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
        const [positions, candidates, voters, voted] = await Promise.all([
          supabase.from("guest_election_positions").select("id", { count: "exact", head: true }).eq("election_id", e.id),
          supabase.from("guest_election_candidates").select("id", { count: "exact", head: true }).eq("election_id", e.id),
          supabase.from("guest_election_voter_assignments").select("id", { count: "exact", head: true }).eq("election_id", e.id),
          supabase.from("guest_election_voter_assignments").select("id", { count: "exact", head: true }).eq("election_id", e.id).eq("has_voted", true),
        ]);

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
          voted_count: voted.count || 0,
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
