import { NextResponse } from "next/server";
import { fetchGuestBrandingServer } from "@/lib/guest-branding";

// Revalidate every 10 seconds at the edge/CDN layer
export const revalidate = 10;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branding = await fetchGuestBrandingServer();
    return NextResponse.json(branding);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load branding";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
