import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/track/click?id=<queue_id>&url=<encoded_destination>
 *
 * Click-tracking redirect. Records the click, then 302-redirects
 * the user to their actual destination.
 */
export async function GET(req: NextRequest) {
  const queueId = req.nextUrl.searchParams.get("id");
  const url = req.nextUrl.searchParams.get("url");
  const isGuest = req.nextUrl.searchParams.get("guest") === "1";

  if (queueId && url) {
    try {
      const supabase = getSupabaseServer();
      if (isGuest) {
        await supabase.from("guest_email_clicks").insert({
          queue_id: queueId,
          url,
        });
      } else {
        const { error } = await supabase.from("email_clicks").insert({
          queue_id: queueId,
          url,
        });
        if (error) {
          // Fallback if queueId is in guest queue
          await supabase.from("guest_email_clicks").insert({
            queue_id: queueId,
            url,
          });
        }
      }
    } catch {
      // Never fail the redirect - analytics is best-effort
    }
  }

  // Always redirect, even if tracking fails
  const destination = url || process.env.NEXT_PUBLIC_SITE_URL || "https://speui.org";

  return NextResponse.redirect(destination, { status: 302 });
}
