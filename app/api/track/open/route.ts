import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * GET /api/track/open?id=<queue_id>
 *
 * Invisible tracking pixel embedded in emails.
 * Records an open event and returns a 1×1 transparent GIF.
 */
export async function GET(req: NextRequest) {
  const queueId = req.nextUrl.searchParams.get("id");
  const isGuest = req.nextUrl.searchParams.get("guest") === "1";

  if (queueId) {
    try {
      const supabase = getSupabaseServer();
      if (isGuest) {
        await supabase.from("guest_email_opens").insert({ queue_id: queueId });
      } else {
        const { error } = await supabase.from("email_opens").insert({ queue_id: queueId });
        if (error) {
          // Fallback if queueId is in guest queue
          await supabase.from("guest_email_opens").insert({ queue_id: queueId });
        }
      }
    } catch {
      // Never fail the pixel - analytics is best-effort
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
