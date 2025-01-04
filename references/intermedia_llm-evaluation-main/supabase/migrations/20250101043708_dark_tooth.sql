/*
  # Update metrics schema with proper constraint handling

  1. Changes
    - Make existing score columns nullable
    - Add new metric columns with constraints
    - Add performance indexes
    - Remove automatic metrics calculation
    
  2. Security
    - No changes to RLS policies
*/

-- Make existing score columns nullable
DO $$ 
BEGIN
  ALTER TABLE metrics ALTER COLUMN accuracy_score DROP NOT NULL;
  ALTER TABLE metrics ALTER COLUMN relevancy_score DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_accuracy_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_relevancy_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_coherence_score_check;
  ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_completeness_score_check;
END $$;

-- Add constraints
ALTER TABLE metrics
ADD CONSTRAINT metrics_accuracy_score_check 
  CHECK (accuracy_score IS NULL OR (accuracy_score >= 0 AND accuracy_score <= 1)),
ADD CONSTRAINT metrics_relevancy_score_check 
  CHECK (relevancy_score IS NULL OR (relevancy_score >= 0 AND relevancy_score <= 1));

-- Add new columns if they don't exist
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
ALTER TABLE metrics
ADD CONSTRAINT metrics_coherence_score_check 
  CHECK (coherence_score IS NULL OR (coherence_score >= 0 AND coherence_score <= 1)),
ADD CONSTRAINT metrics_completeness_score_check 
  CHECK (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 1));

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_metrics_scores;
DROP INDEX IF EXISTS idx_metrics_response_id;

-- Create new indexes
CREATE INDEX idx_metrics_scores 
ON metrics (accuracy_score, relevancy_score, coherence_score, completeness_score);

CREATE INDEX idx_metrics_response_id 
ON metrics (response_id);

-- Remove the automatic metrics calculation
DROP TRIGGER IF EXISTS calculate_metrics_on_response ON llm_responses;
DROP FUNCTION IF EXISTS calculate_response_metrics();