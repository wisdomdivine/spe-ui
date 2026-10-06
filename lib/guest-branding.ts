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
  organization_name: "Association of Faculty of Arts Students",
  organization_acronym: "AFAS",
  organization_full_name: "Association of Faculty of Arts Students · University of Ibadan",
  logo_url: "/afas-logo.png",
  cobranding_title: "SPE UI x AFAS",
  hero_title: "Guest Voting,\nSecure & Direct.",
  hero_description: "Electoral portal provided in collaboration with the Association of Faculty of Arts Students (AFAS), University of Ibadan.",
  portal_badge: "Official AFAS Electoral Portal",
  auth_badge: "AFAS Voter Verification",
  faculty_name: "Faculty of Arts",
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
