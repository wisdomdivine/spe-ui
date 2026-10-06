-- ═══════════════════════════════════════════════════════════
-- Option to hide completed elections from frontend for guest
-- ═══════════════════════════════════════════════════════════

-- 1. Global toggle in guest_branding
ALTER TABLE guest_branding
ADD COLUMN IF NOT EXISTS hide_completed_elections boolean NOT NULL DEFAULT false;

-- 2. Per-election toggle in guest_elections (allows hiding individual elections)
ALTER TABLE guest_elections
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
