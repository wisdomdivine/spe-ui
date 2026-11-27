import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";
import { isVoterEligibleForPosition } from "@/lib/position-eligibility";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voterId = req.nextUrl.searchParams.get("voter_id")?.trim() || null;
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

    // Fetch positions with candidates, voter counts, and optional voter profile in parallel
    const [positionsRes, candidatesRes, votersRes, votedRes, voterProfileRes] = await Promise.all([
      supabase
        .from("election_positions")
        .select("id, title, description, sort_order, position_type, allow_multiple, min_selections, max_selections, eligible_levels, eligible_departments, eligible_constituencies")
        .eq("election_id", id)
        .order("sort_order"),
      supabase
        .from("election_candidates")
        .select("id, position_id, name, matric_number, image_url, manifesto")
        .eq("election_id", id),
      supabase
        .from("election_voter_assignments")
        .select("id", { count: "exact", head: true })
        .eq("election_id", id),
      supabase
        .from("election_voter_assignments")
        .select("id", { count: "exact", head: true })
        .eq("election_id", id)
        .eq("has_voted", true),
      voterId
        ? supabase
            .from("voters")
            .select("id, level, department, constituency")
            .eq("id", voterId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
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

    const allPositions = (positionsRes.data || []).map((p) => ({
      ...p,
      position_type: p.position_type || "executive",
      allow_multiple: Boolean(p.allow_multiple),
      min_selections: p.min_selections ?? 1,
      max_selections: p.max_selections ?? 1,
      eligible_levels: Array.isArray(p.eligible_levels) ? p.eligible_levels : [],
      eligible_departments: Array.isArray(p.eligible_departments) ? p.eligible_departments : [],
      eligible_constituencies: Array.isArray(p.eligible_constituencies) ? p.eligible_constituencies : [],
      candidates: candidatesByPosition[p.id] || [],
    }));

    const positions = voterId
      ? allPositions.filter((p) => isVoterEligibleForPosition(voterProfileRes.data, p))
      : allPositions;

    return NextResponse.json(
      {
        id: election.id,
        title: election.title,
        description: election.description,
        status: liveStatus,
        is_open: election.is_open ?? false,
        election_type: election.election_type || "executive",
        require_accreditation: Boolean(election.require_accreditation),
        election_date: election.election_date,
        start_time: election.start_time,
        end_time: election.end_time,
        voter_auth_type: election.voter_auth_type || "matric",
        positions,
        total_positions_count: allPositions.length,
        voters_count: votersRes.count || 0,
        voted_count: votedRes.count || 0,
      },
      {
        headers: {
          "Cache-Control": voterId
            ? "no-store, no-cache, must-revalidate"
            : "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch election";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
