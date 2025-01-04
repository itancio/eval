/*
  # Update metrics table to prevent null values

  1. Changes
    - Make all metric score columns non-nullable with default value of 0
    - Update any existing null values to 0
    - Add check constraints to ensure values are between 0 and 1

  2. Security
    - Temporarily disable RLS for the update
    - Re-enable RLS after the update
*/

-- Temporarily disable RLS
ALTER TABLE metrics DISABLE ROW LEVEL SECURITY;

-- Update existing null values to 0
UPDATE metrics 
SET 
  accuracy_score = COALESCE(accuracy_score, 0),
  relevancy_score = COALESCE(relevancy_score, 0),
  coherence_score = COALESCE(coherence_score, 0),
  completeness_score = COALESCE(completeness_score, 0);

-- Modify columns to be non-nullable with default values
ALTER TABLE metrics
  ALTER COLUMN accuracy_score SET NOT NULL,
  ALTER COLUMN accuracy_score SET DEFAULT 0,
  ALTER COLUMN relevancy_score SET NOT NULL,
  ALTER COLUMN relevancy_score SET DEFAULT 0,
  ALTER COLUMN coherence_score SET NOT NULL,
  ALTER COLUMN coherence_score SET DEFAULT 0,
  ALTER COLUMN completeness_score SET NOT NULL,
  ALTER COLUMN completeness_score SET DEFAULT 0;

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_accuracy_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_relevancy_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_coherence_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_completeness_score_check;
END $$;

-- Add constraints to ensure values are between 0 and 1
ALTER TABLE metrics
  ADD CONSTRAINT metrics_accuracy_score_check 
    CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  ADD CONSTRAINT metrics_relevancy_score_check 
    CHECK (relevancy_score >= 0 AND relevancy_score <= 1),
  ADD CONSTRAINT metrics_coherence_score_check 
    CHECK (coherence_score >= 0 AND coherence_score <= 1),
  ADD CONSTRAINT metrics_completeness_score_check 
    CHECK (completeness_score >= 0 AND completeness_score <= 1);

-- Re-enable RLS
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;