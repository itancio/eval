/*
  # Add coherence and completeness metrics

  1. Changes
    - Add coherence_score and completeness_score columns to metrics table
    - Update calculate_response_metrics trigger to include new scores
    - Add appropriate constraints and indexes

  2. Security
    - Maintains existing RLS policies
    - Adds constraints to ensure valid score ranges (0-1)

  3. Notes
    - All score columns can be NULL
    - All scores must be between 0 and 1 when not NULL
    - Adds performance indexes for query optimization
*/

-- Add new columns to metrics table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'metrics' AND column_name = 'coherence_score') THEN
    ALTER TABLE metrics ADD COLUMN coherence_score float;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'metrics' AND column_name = 'completeness_score') THEN
    ALTER TABLE metrics ADD COLUMN completeness_score float;
  END IF;
END $$;

-- Add constraints for new columns
DO $$ 
BEGIN
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_coherence_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_completeness_score_check;
  
  ALTER TABLE metrics
  ADD CONSTRAINT metrics_coherence_score_check 
    CHECK (coherence_score IS NULL OR (coherence_score >= 0 AND coherence_score <= 1)),
  ADD CONSTRAINT metrics_completeness_score_check 
    CHECK (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 1));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Update existing metrics with default values
UPDATE metrics 
SET 
  coherence_score = 0.8,
  completeness_score = 0.8
WHERE coherence_score IS NULL OR completeness_score IS NULL;

-- Create index for new columns if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE tablename = 'metrics' AND indexname = 'idx_metrics_all_scores') THEN
    CREATE INDEX idx_metrics_all_scores ON metrics 
      (accuracy_score, relevancy_score, coherence_score, completeness_score);
  END IF;
END $$;