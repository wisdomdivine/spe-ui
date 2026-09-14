import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { sendTicketEmail } from "@/lib/mailer";

function generateAccessCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SPE-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();
    const body = await req.json();
    const {
      name,
      email,
      department,
      is_spe_member,
      is_membership_active,
      whatsapp_number,
      event_name,
      selected_days,
    } = body;

    const targetEventName = event_name || "Industry Week '26";

    // Verify if registration is open in the database
    const { data: eventData } = await supabaseServer
      .from("events")
      .select("id, is_registration_open")
      .ilike("title", targetEventName)
      .limit(1)
      .maybeSingle();

    if (eventData && eventData.is_registration_open === false) {
      return NextResponse.json(
        { error: "Registrations for this event are currently closed." },
        { status: 403 }
      );
    }

    // Basic Validations
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!whatsapp_number || typeof whatsapp_number !== "string" || !whatsapp_number.trim()) {
      return NextResponse.json({ error: "Phone / WhatsApp number is required" }, { status: 400 });
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    if (!selected_days || (Array.isArray(selected_days) && selected_days.length === 0)) {
      return NextResponse.json({ error: "Please select at least one day to attend" }, { status: 400 });
    }

    if (typeof is_spe_member !== "boolean") {
      return NextResponse.json({ error: "SPE membership selection is required" }, { status: 400 });
    }

    if (is_spe_member && typeof is_membership_active !== "boolean") {
      return NextResponse.json({ error: "Please specify if your SPE membership is active" }, { status: 400 });
    }

    // Check if registration already exists for this email to prevent duplicates
    const { data: existingReg } = await supabaseServer
      .from("event_registrations")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .limit(1);

    if (existingReg && existingReg.length > 0) {
      return NextResponse.json({ error: "This email address is already registered." }, { status: 400 });
    }

    const accessCode = generateAccessCode();
    const daysString = Array.isArray(selected_days)
      ? selected_days.join(", ")
      : (selected_days || "Day 1, Day 2, Day 3, Day 4, Day 5");

    const { data, error } = await supabaseServer
      .from("event_registrations")
      .insert({
        event_name: targetEventName,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        is_spe_member,
        is_membership_active: is_spe_member ? is_membership_active : null,
        whatsapp_number: whatsapp_number.trim(),
        access_code: accessCode,
        selected_days: daysString,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger ticket invite email
    try {
      await sendTicketEmail({
        to: email.trim().toLowerCase(),
        name: name.trim(),
        department: department.trim(),
        registrationId: data.id,
        accessCode,
        selectedDays: daysString,
      });
      console.log("Successfully sent ticket email to:", email);
    } catch (err) {
      console.error("Failed to send ticket email:", err);
    }

    return NextResponse.json({ success: true, id: data.id, access_code: accessCode }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 });
  }
}
