import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

// Revalidate every 30 seconds at the CDN / Edge layer
export const revalidate = 30;

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

    const candidates = (candidatesRes.data || []).map((c: any) => ({
      ...c,
      bio: c.manifesto || c.bio || null,
      manifesto: c.manifesto || c.bio || null,
    }));

    return NextResponse.json(
      {
        election: {
          ...election,
          status: liveStatus,
        },
        positions: positionsRes.data || [],
        candidates,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
