import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendOtpEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/** Generate a random 6-digit OTP string */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/elections/[id]/auth
 * Validates a voter's matric number for this election.
 * - Checks voter exists globally
 * - Checks voter is assigned to this election
 * - Checks voter hasn't already voted
 * - Generates OTP, stores in DB, and sends via email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json();
    const supabase = getSupabaseServer();

    // 0. Check election exists, is open, and get auth method
    const { data: election, error: elErr } = await supabase
      .from("elections")
      .select("id, is_open, voter_auth_type")
      .eq("id", electionId)
      .single();

    if (elErr || !election) {
      return NextResponse.json(
        { error: "Election not found." },
        { status: 404 }
      );
    }

    if (!election.is_open) {
      return NextResponse.json(
        { error: "This election is not open for voting yet." },
        { status: 403 }
      );
    }

    const authType = election.voter_auth_type === "email" ? "email" : "matric";
    const rawIdentifier = (
      authType === "email"
        ? (body.email || body.identifier || body.matric_number)
        : (body.matric_number || body.identifier || body.email)
    )?.trim();

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: authType === "email" ? "Email address is required." : "Matric number is required." },
        { status: 400 }
      );
    }

    // 1. Find voter by email or matric number
    let voterQuery = supabase
      .from("voters")
      .select("id, name, email, matric_number");

    if (authType === "email") {
      voterQuery = voterQuery.ilike("email", rawIdentifier);
    } else {
      voterQuery = voterQuery.eq("matric_number", rawIdentifier);
    }

    const { data: voter, error: voterErr } = await voterQuery.maybeSingle();

    if (voterErr || !voter) {
      return NextResponse.json(
        {
          error:
            authType === "email"
              ? "No accredited voter found with this email address."
              : "No voter found with this matric number.",
        },
        { status: 404 }
      );
    }

    // 2. Check voter is assigned to this election
    const { data: assignment, error: assignErr } = await supabase
      .from("election_voter_assignments")
      .select("id, has_voted")
      .eq("election_id", electionId)
      .eq("voter_id", voter.id)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json(
        { error: "You are not eligible to vote in this election." },
        { status: 403 }
      );
    }

    // 3. Check voter hasn't already voted
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
      .from("voter_otps")
      .delete()
      .eq("voter_id", voter.id)
      .eq("election_id", electionId);

    // 6. Generate OTP with 10-minute expiry
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase
      .from("voter_otps")
      .insert({
        voter_id: voter.id,
        election_id: electionId,
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (insertErr) {
      console.error("OTP insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to generate verification code." },
        { status: 500 }
      );
    }

    // 7. Fetch election title for the email
    const { data: electionData } = await supabase
      .from("elections")
      .select("title")
      .eq("id", electionId)
      .single();

    // 8. Send OTP email
    try {
      await sendOtpEmail({
        to: voter.email,
        voterName: voter.name || "Voter",
        otp: otpCode,
        electionTitle: electionData?.title || "SPE-UI Election",
      });
    } catch (emailErr) {
      console.error("SMTP send error:", emailErr);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // 9. Mask voter email for display
    const [local, domain] = voter.email.split("@");
    const maskedEmail = local.slice(0, 2) + "***@" + domain;

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
