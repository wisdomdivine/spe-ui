-- Add is_registration_open column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT true;

-- Update existing events to have is_registration_open set to true
UPDATE events SET is_registration_open = true WHERE is_registration_open IS NULL;
