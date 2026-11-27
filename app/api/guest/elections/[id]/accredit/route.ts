import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { computeElectionStatus } from "@/lib/election-status";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest/elections/[id]/accredit
 * Completes one-click email accreditation for a guest voter using their unique accreditation token.
 * Body: { token: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json(
        { error: "Missing accreditation token." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const [{ data: election, error: elErr }, { data: assignment, error: asgErr }] = await Promise.all([
      supabase
        .from("guest_elections")
        .select("id, title, status, is_open, election_date, start_time, end_time, require_accreditation")
        .eq("id", electionId)
        .single(),
      supabase
        .from("guest_election_voter_assignments")
        .select("id, voter_id, is_accredited, accredited_at, guest_voters(id, name, email, matric_number)")
        .eq("election_id", electionId)
        .eq("accreditation_token", token)
        .maybeSingle(),
    ]);

    if (elErr || !election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    if (asgErr || !assignment) {
      return NextResponse.json(
        { error: "Invalid or expired accreditation link. Please contact the electoral committee." },
        { status: 404 }
      );
    }

    const liveStatus = computeElectionStatus(election);
    if (liveStatus === "Completed" || election.status === "Completed") {
      return NextResponse.json(
        { error: "This election has already concluded. Accreditation is closed." },
        { status: 410 }
      );
    }

    const voterObj = Array.isArray(assignment.guest_voters) ? assignment.guest_voters[0] : assignment.guest_voters;
    const voterName = (voterObj as { name?: string } | null)?.name || "Voter";

    if (assignment.is_accredited) {
      return NextResponse.json({
        success: true,
        already_accredited: true,
        accredited_at: assignment.accredited_at,
        voter_name: voterName,
        election_title: election.title,
        election_status: liveStatus,
        is_open: Boolean(election.is_open),
      });
    }

    const now = new Date().toISOString();
    const { error: updErr } = await supabase
      .from("guest_election_voter_assignments")
      .update({ is_accredited: true, accredited_at: now })
      .eq("id", assignment.id);

    if (updErr) {
      return NextResponse.json(
        { error: "Failed to complete accreditation. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      already_accredited: false,
      accredited_at: now,
      voter_name: voterName,
      election_title: election.title,
      election_status: liveStatus,
      is_open: Boolean(election.is_open),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Accreditation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
