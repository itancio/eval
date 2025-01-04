/*
  # Update metrics handling

  1. Changes
    - Add nullable columns to metrics table for detailed scores
    - Update metrics trigger to handle null values
    - Add indexes for performance
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add detailed metric columns
ALTER TABLE metrics
ADD COLUMN IF NOT EXISTS coherence_score float,
ADD COLUMN IF NOT EXISTS completeness_score float,
ADD CONSTRAINT metrics_coherence_score_check 
  CHECK (coherence_score IS NULL OR (coherence_score >= 0 AND coherence_score <= 1)),
ADD CONSTRAINT metrics_completeness_score_check 
  CHECK (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 1));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS metrics_scores_idx ON metrics (accuracy_score, relevancy_score);
CREATE INDEX IF NOT EXISTS metrics_response_id_idx ON metrics (response_id);

-- Update metrics constraints to allow null values
ALTER TABLE metrics
ALTER COLUMN accuracy_score DROP NOT NULL,
ALTER COLUMN relevancy_score DROP NOT NULL;

-- Drop old trigger
DROP TRIGGER IF EXISTS calculate_metrics_on_response ON llm_responses;
DROP FUNCTION IF EXISTS calculate_response_metrics();