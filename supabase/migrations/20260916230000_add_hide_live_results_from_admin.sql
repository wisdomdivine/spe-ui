-- Add hide_live_results_from_admin to elections and guest_elections
ALTER TABLE elections ADD COLUMN IF NOT EXISTS hide_live_results_from_admin boolean DEFAULT false;
ALTER TABLE guest_elections ADD COLUMN IF NOT EXISTS hide_live_results_from_admin boolean DEFAULT false;
