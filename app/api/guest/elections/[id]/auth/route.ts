import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendOtpEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/** Generate a random 6-digit OTP string */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/guest/elections/[id]/auth
 * Validates a guest voter's matric number for this election.
 * - Checks voter exists in guest_voters
 * - Checks voter is assigned to this guest election
 * - Checks voter hasn't already voted
 * - Generates OTP, stores in guest_voter_otps, and sends via email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json();
    const { matric_number } = body;

    if (!matric_number?.trim()) {
      return NextResponse.json(
        { error: "Matric number is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // 1. Check election exists and is open
    const { data: election, error: elErr } = await supabase
      .from("guest_elections")
      .select("id, title, is_open, status")
      .eq("id", electionId)
      .single();

    if (elErr || !election) {
      return NextResponse.json(
        { error: "Election not found." },
        { status: 404 }
      );
    }

    if (!election.is_open && election.status !== "Active") {
      return NextResponse.json(
        { error: "This election is not open for voting yet." },
        { status: 403 }
      );
    }

    // 2. Find voter in guest_voters
    const { data: voter, error: voterErr } = await supabase
      .from("guest_voters")
      .select("id, name, matric_number, email")
      .eq("matric_number", matric_number.trim())
      .single();

    if (voterErr || !voter) {
      return NextResponse.json(
        { error: "No guest voter found with this matric number." },
        { status: 404 }
      );
    }

    // 3. Check voter assignment
    const { data: assignment, error: assignErr } = await supabase
      .from("guest_election_voter_assignments")
      .select("id, has_voted")
      .eq("election_id", electionId)
      .eq("voter_id", voter.id)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json(
        { error: "You are not eligible to vote in this guest election." },
        { status: 403 }
      );
    }

    if (assignment.has_voted) {
      return NextResponse.json(
        { error: "You have already voted in this election." },
        { status: 409 }
      );
    }

    // 4. Check voter has an email address
    if (!voter.email) {
      return NextResponse.json(
        { error: "No email address on file. Contact an administrator." },
        { status: 422 }
      );
    }

    // 5. Delete any previous OTPs for this voter + election
    await supabase
      .from("guest_voter_otps")
      .delete()
      .eq("voter_id", voter.id)
      .eq("election_id", electionId);

    // 6. Generate OTP with 10-minute expiry
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase
      .from("guest_voter_otps")
      .insert({
        voter_id: voter.id,
        election_id: electionId,
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (insertErr) {
      console.error("Guest OTP insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to generate verification code." },
        { status: 500 }
      );
    }

    // 7. Send OTP email
    try {
      await sendOtpEmail({
        to: voter.email,
        voterName: voter.name || "Guest Voter",
        otp: otpCode,
        electionTitle: election.title || "Guest Electoral Session",
      });
    } catch (emailErr) {
      console.error("SMTP send error for guest OTP:", emailErr);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // 8. Mask voter email for display
    const [local, domain] = voter.email.split("@");
    const maskedEmail = (local.length > 2 ? local.slice(0, 2) : local) + "***@" + (domain || "");

    return NextResponse.json({
      voter_id: voter.id,
      voter_name: voter.name,
      matric_number: voter.matric_number,
      masked_email: maskedEmail,
      otp_sent: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
