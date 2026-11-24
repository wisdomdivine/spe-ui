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

    const [electionRes, positionsRes, candidatesRes, voterProfileRes] = await Promise.all([
      supabase.from("guest_elections").select("*").eq("id", id).single(),
      supabase.from("guest_election_positions").select("*").eq("election_id", id).order("sort_order"),
      supabase.from("guest_election_candidates").select("*").eq("election_id", id),
      voterId
        ? supabase
            .from("guest_voters")
            .select("id, level, department, floor")
            .eq("id", voterId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (electionRes.error || !electionRes.data) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const election = electionRes.data;
    const liveStatus = computeElectionStatus(election);

    const allPositions = (positionsRes.data || []).map((p: any) => ({
      ...p,
      position_type: p.position_type || "executive",
      allow_multiple: Boolean(p.allow_multiple),
      min_selections: p.min_selections ?? 1,
      max_selections: p.max_selections ?? 1,
      eligible_levels: Array.isArray(p.eligible_levels) ? p.eligible_levels : [],
      eligible_departments: Array.isArray(p.eligible_departments) ? p.eligible_departments : [],
      eligible_floors: Array.isArray(p.eligible_floors) ? p.eligible_floors : [],
    }));

    const positions = voterId
      ? allPositions.filter((p: any) => isVoterEligibleForPosition(voterProfileRes.data, p))
      : allPositions;

    const eligiblePosIds = new Set(positions.map((p: any) => p.id));

    const candidates = (candidatesRes.data || [])
      .filter((c: any) => !voterId || eligiblePosIds.has(c.position_id))
      .map((c: any) => ({
        ...c,
        bio: c.manifesto || c.bio || null,
        manifesto: c.manifesto || c.bio || null,
      }));

    return NextResponse.json(
      {
        election: {
          ...election,
          election_type: election.election_type || "executive",
          status: liveStatus,
        },
        positions,
        total_positions_count: allPositions.length,
        candidates,
      },
      {
        headers: {
          "Cache-Control": voterId
            ? "no-store, no-cache, must-revalidate"
            : "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
