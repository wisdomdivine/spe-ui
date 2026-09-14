import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/events - public events list (Upcoming + Ongoing + Completed)
 * Uses service_role to bypass RLS.
 */
export async function GET() {
  try {
    const supabaseServer = getSupabaseServer();
    const { data, error } = await supabaseServer
      .from("events")
      .select("id, title, date, time, location, image_url, event_link, status, description, is_registration_open")
      .in("status", ["Upcoming", "Ongoing", "Completed"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
