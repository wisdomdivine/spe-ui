import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    // Fetch election
    const { data: election, error: elErr } = await supabase
      .from("elections")
      .select("*")
      .eq("id", id)
      .single();

    if (elErr || !election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const liveStatus = computeElectionStatus(election);

    // Fetch positions with candidates, and voter counts in parallel
    const [positionsRes, candidatesRes, votersRes, votedRes] = await Promise.all([
      supabase
        .from("election_positions")
        .select("id, title, description, sort_order")
        .eq("election_id", id)
        .order("sort_order"),
      supabase
        .from("election_candidates")
        .select("id, position_id, name, matric_number, image_url, manifesto")
        .eq("election_id", id),
      supabase
        .from("election_voter_assignments")
        .select("id")
        .eq("election_id", id),
      supabase
        .from("election_voter_assignments")
        .select("id")
        .eq("election_id", id)
        .eq("has_voted", true),
    ]);

    // Group candidates by position
    const candidatesByPosition: Record<string, Array<{
      id: string;
      position_id: string;
      name: string;
      matric_number: string | null;
      image_url: string | null;
      bio: string | null;
    }>> = {};
    (candidatesRes.data || []).forEach((c) => {
      if (!candidatesByPosition[c.position_id]) {
        candidatesByPosition[c.position_id] = [];
      }
      candidatesByPosition[c.position_id]!.push({
        id: c.id,
        position_id: c.position_id,
        name: c.name,
        matric_number: c.matric_number,
        image_url: c.image_url,
        bio: c.manifesto,
      });
    });

    const positions = (positionsRes.data || []).map((p) => ({
      ...p,
      candidates: candidatesByPosition[p.id] || [],
    }));

    return NextResponse.json({
      id: election.id,
      title: election.title,
      description: election.description,
      status: liveStatus,
      is_open: election.is_open ?? false,
      election_date: election.election_date,
      start_time: election.start_time,
      end_time: election.end_time,
      voter_auth_type: election.voter_auth_type || "matric",
      positions,
      voters_count: votersRes.data?.length || 0,
      voted_count: votedRes.data?.length || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch election";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
