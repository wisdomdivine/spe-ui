import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/guest/elections/[id]/verify-otp
 * Validates the OTP entered by the guest voter.
 * - Checks OTP exists for this voter + election in guest_voter_otps
 * - Checks OTP hasn't expired (10 min window)
 * - Deletes OTP after successful verification
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await params;
    const body = await req.json();
    const { voter_id, otp_code } = body;

    if (!voter_id || !otp_code) {
      return NextResponse.json(
        { error: "Voter ID and OTP code are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // 1. Find the OTP record
    const { data: otpRecord, error: otpErr } = await supabase
      .from("guest_voter_otps")
      .select("id, otp_code, expires_at")
      .eq("voter_id", voter_id)
      .eq("election_id", electionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !otpRecord) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    // 2. Check if OTP has expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Clean up expired OTP
      await supabase
        .from("guest_voter_otps")
        .delete()
        .eq("id", otpRecord.id);

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // 3. Validate the OTP code
    if (otpRecord.otp_code !== otp_code.trim()) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 401 }
      );
    }

    // 4. OTP is valid - delete it (one-time use)
    await supabase
      .from("guest_voter_otps")
      .delete()
      .eq("id", otpRecord.id);

    return NextResponse.json({
      verified: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
