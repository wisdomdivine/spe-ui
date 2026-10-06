import { getSupabaseServer } from "./supabase-server";

export interface GuestBranding {
  id: string;
  organization_name: string;
  organization_acronym: string;
  organization_full_name: string;
  logo_url: string;
  cobranding_title: string;
  hero_title: string;
  hero_description: string;
  portal_badge: string;
  auth_badge: string;
  faculty_name: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_GUEST_BRANDING: GuestBranding = {
  id: "default",
  organization_name: "Guest Electoral Session",
  organization_acronym: "Guest",
  organization_full_name: "Guest Electoral Session · University of Ibadan",
  logo_url: "/guest-logo.svg",
  cobranding_title: "SPE UI x Guest",
  hero_title: "Guest Voting,\nSecure & Direct.",
  hero_description: "Official guest electoral portal provided in collaboration with partner organizations and student associations, University of Ibadan.",
  portal_badge: "Official Guest Electoral Portal",
  auth_badge: "Guest Voter Verification",
  faculty_name: "Guest Session",
};

export async function fetchGuestBrandingServer(): Promise<GuestBranding> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("guest_branding")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_GUEST_BRANDING;
    }

    return {
      ...DEFAULT_GUEST_BRANDING,
      ...data,
    };
  } catch {
    return DEFAULT_GUEST_BRANDING;
  }
}
