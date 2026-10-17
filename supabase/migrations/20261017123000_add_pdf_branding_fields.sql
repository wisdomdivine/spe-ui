-- ═══════════════════════════════════════════════════════════
-- Customizable Results PDF Branding for Guest Elections
-- ═══════════════════════════════════════════════════════════

ALTER TABLE guest_branding
ADD COLUMN IF NOT EXISTS pdf_header_title text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS pdf_commission_title text NOT NULL DEFAULT 'INDEPENDENT ELECTORAL COMMISSION',
ADD COLUMN IF NOT EXISTS pdf_institution_title text NOT NULL DEFAULT 'UNIVERSITY OF IBADAN',
ADD COLUMN IF NOT EXISTS pdf_primary_color text NOT NULL DEFAULT '#B40F69',
ADD COLUMN IF NOT EXISTS pdf_watermark_url text NOT NULL DEFAULT '';
