import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json();
    const { matric_number } = body;

    if (!matric_number?.trim()) {
      return NextResponse.json({ error: "Matric number is required." }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // 1. Check election exists and is open
    const { data: election, error: elErr } = await supabase
      .from("guest_elections")
      .select("id, is_open, status")
      .eq("id", electionId)
      .single();

    if (elErr || !election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    if (!election.is_open && election.status !== "Active") {
      return NextResponse.json({ error: "This election is not open for voting yet." }, { status: 403 });
    }

    // 2. Find voter in guest_voters
    const { data: voter, error: voterErr } = await supabase
      .from("guest_voters")
      .select("id, name, matric_number, email")
      .eq("matric_number", matric_number.trim())
      .single();

    if (voterErr || !voter) {
      return NextResponse.json({ error: "No guest voter found with this matric number." }, { status: 404 });
    }

    // 3. Check voter assignment
    const { data: assignment, error: assignErr } = await supabase
      .from("guest_election_voter_assignments")
      .select("id, has_voted")
      .eq("election_id", electionId)
      .eq("voter_id", voter.id)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json({ error: "You are not eligible to vote in this guest election." }, { status: 403 });
    }

    if (assignment.has_voted) {
      return NextResponse.json({ error: "You have already voted in this election." }, { status: 409 });
    }

    // Guest auth success: returns authenticated voter session payload
    return NextResponse.json({
      success: true,
      voter: {
        id: voter.id,
        name: voter.name,
        matric_number: voter.matric_number,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
