-- Migration: 20260914112500_add_showdown_history_leaderboard.sql
-- Description: Adds players_leaderboard to showdown_history for full player scores and CSV export.

ALTER TABLE showdown_history
ADD COLUMN IF NOT EXISTS players_leaderboard JSONB DEFAULT '[]'::jsonb;
