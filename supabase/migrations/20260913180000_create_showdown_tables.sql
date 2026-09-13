-- Migration: 20260913180000_create_showdown_tables.sql
-- Description: Creates showdown_quizzes, showdown_questions, and showdown_history tables with RLS and seed data.

CREATE TABLE IF NOT EXISTS showdown_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  created_by TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showdown_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES showdown_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  image_url TEXT,
  time_limit INT DEFAULT 20,
  points INT DEFAULT 1000,
  order_index INT NOT NULL DEFAULT 0,
  options JSONB NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showdown_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES showdown_quizzes(id) ON DELETE SET NULL,
  quiz_title TEXT NOT NULL,
  pin VARCHAR(6) NOT NULL,
  total_players INT NOT NULL DEFAULT 0,
  top_three JSONB NOT NULL DEFAULT '[]'::jsonb,
  hosted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE showdown_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE showdown_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE showdown_history ENABLE ROW LEVEL SECURITY;

-- Policies for public reading of quizzes & questions
DROP POLICY IF EXISTS "Public read showdown_quizzes" ON showdown_quizzes;
CREATE POLICY "Public read showdown_quizzes" ON showdown_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read showdown_questions" ON showdown_questions;
CREATE POLICY "Public read showdown_questions" ON showdown_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read showdown_history" ON showdown_history;
CREATE POLICY "Public read showdown_history" ON showdown_history FOR SELECT USING (true);

-- Allow authenticated/service role insert/update/delete
DROP POLICY IF EXISTS "Admin write showdown_quizzes" ON showdown_quizzes;
CREATE POLICY "Admin write showdown_quizzes" ON showdown_quizzes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write showdown_questions" ON showdown_questions;
CREATE POLICY "Admin write showdown_questions" ON showdown_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write showdown_history" ON showdown_history;
CREATE POLICY "Admin write showdown_history" ON showdown_history FOR ALL USING (true) WITH CHECK (true);

-- Seed Initial Starter Quiz if empty
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM showdown_quizzes LIMIT 1) THEN
    INSERT INTO showdown_quizzes (id, title, description, category, is_published)
    VALUES (
      'd1000000-0000-0000-0000-000000000001',
      'SPE PetroBowl & Energy Trivia',
      'Challenge your knowledge on reservoir engineering, drilling, energy history, and SPE chapter trivia.',
      'Petroleum',
      true
    )
    RETURNING id INTO v_quiz_id;

    -- Question 1
    INSERT INTO showdown_questions (quiz_id, question_text, time_limit, points, order_index, options)
    VALUES (
      v_quiz_id,
      'What parameter does Darcy''s Law primarily calculate in porous media?',
      20,
      1000,
      1,
      '[
        {"id": 1, "text": "Fluid Flow Rate (Discharge)", "is_correct": true},
        {"id": 2, "text": "Rock Density", "is_correct": false},
        {"id": 3, "text": "Surface Tension", "is_correct": false},
        {"id": 4, "text": "Thermal Gradient", "is_correct": false}
      ]'::jsonb
    );

    -- Question 2
    INSERT INTO showdown_questions (quiz_id, question_text, time_limit, points, order_index, options)
    VALUES (
      v_quiz_id,
      'Which Nigerian oil field was the first commercial discovery in 1956?',
      20,
      1000,
      2,
      '[
        {"id": 1, "text": "Oloibiri", "is_correct": true},
        {"id": 2, "text": "Bonga", "is_correct": false},
        {"id": 3, "text": "Escravos", "is_correct": false},
        {"id": 4, "text": "Forcados", "is_correct": false}
      ]'::jsonb
    );

    -- Question 3
    INSERT INTO showdown_questions (quiz_id, question_text, time_limit, points, order_index, options)
    VALUES (
      v_quiz_id,
      'What does API gravity measure in petroleum fluids?',
      20,
      1000,
      3,
      '[
        {"id": 1, "text": "Relative heaviness compared to water", "is_correct": true},
        {"id": 2, "text": "Viscosity at downhole pressure", "is_correct": false},
        {"id": 3, "text": "Sulfur concentration", "is_correct": false},
        {"id": 4, "text": "Acoustic impedance", "is_correct": false}
      ]'::jsonb
    );

    -- Question 4
    INSERT INTO showdown_questions (quiz_id, question_text, time_limit, points, order_index, options)
    VALUES (
      v_quiz_id,
      'In drilling operations, what device prevents uncontrolled release of well fluids?',
      20,
      1000,
      4,
      '[
        {"id": 1, "text": "Blowout Preventer (BOP)", "is_correct": true},
        {"id": 2, "text": "Rotary Swivel", "is_correct": false},
        {"id": 3, "text": "Crown Block", "is_correct": false},
        {"id": 4, "text": "Kelly Drive", "is_correct": false}
      ]'::jsonb
    );

    -- Question 5
    INSERT INTO showdown_questions (quiz_id, question_text, time_limit, points, order_index, options)
    VALUES (
      v_quiz_id,
      'What is the standard volume of 1 barrel (bbl) of crude oil in US gallons?',
      15,
      1000,
      5,
      '[
        {"id": 1, "text": "42 US Gallons", "is_correct": true},
        {"id": 2, "text": "55 US Gallons", "is_correct": false},
        {"id": 3, "text": "36 US Gallons", "is_correct": false},
        {"id": 4, "text": "50 US Gallons", "is_correct": false}
      ]'::jsonb
    );
  END IF;
END $$;
