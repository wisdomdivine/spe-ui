-- Migration: 20260914180000_extend_game_leaderboards.sql
-- Description: Extends leaderboard table with mode, difficulty, and details columns for advanced game leaderboards.

ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Create index for fast leaderboard lookups per game and mode
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_mode_score 
ON leaderboard (game, mode, score);
