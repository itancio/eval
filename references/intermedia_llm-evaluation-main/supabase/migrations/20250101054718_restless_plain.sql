/*
  # Add coherence and completeness metrics

  1. Changes
    - Add coherence_score and completeness_score columns to metrics table
    - Update calculate_response_metrics trigger to include new scores
*/

-- Add new columns to metrics table
ALTER TABLE metrics 
ADD COLUMN coherence_score float CHECK (coherence_score >= 0 AND coherence_score <= 1),
ADD COLUMN completeness_score float CHECK (completeness_score >= 0 AND completeness_score <= 1);

-- Update existing metrics with default values
UPDATE metrics 
SET 
  coherence_score = 0.8,
  completeness_score = 0.8
WHERE coherence_score IS NULL OR completeness_score IS NULL;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS calculate_metrics_on_response ON llm_responses;
DROP FUNCTION IF EXISTS calculate_response_metrics();

-- Create updated function with all metrics
CREATE OR REPLACE FUNCTION calculate_response_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert metrics for new responses with all scores
  INSERT INTO metrics (
    response_id,
    accuracy_score,
    relevancy_score,
    coherence_score,
    completeness_score
  ) VALUES (
    NEW.id,
    0.85, -- Default accuracy score
    0.80, -- Default relevancy score
    0.80, -- Default coherence score
    0.80  -- Default completeness score
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger
CREATE TRIGGER calculate_metrics_on_response
  AFTER INSERT ON llm_responses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_response_metrics();
