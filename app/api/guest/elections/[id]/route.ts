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

    const [electionRes, positionsRes, candidatesRes] = await Promise.all([
      supabase.from("guest_elections").select("*").eq("id", id).single(),
      supabase.from("guest_election_positions").select("*").eq("election_id", id).order("sort_order"),
      supabase.from("guest_election_candidates").select("*").eq("election_id", id),
    ]);

    if (electionRes.error || !electionRes.data) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 });
    }

    const election = electionRes.data;
    const liveStatus = computeElectionStatus(election);

    return NextResponse.json({
      election: {
        ...election,
        status: liveStatus,
      },
      positions: positionsRes.data || [],
      candidates: candidatesRes.data || [],
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
