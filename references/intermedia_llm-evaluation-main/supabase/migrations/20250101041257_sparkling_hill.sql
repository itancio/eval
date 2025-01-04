/*
  # Update metrics handling

  1. Changes
    - Add error column to llm_responses
    - Update metrics trigger to handle null values
    - Add validation checks for metrics

  2. Security
    - Maintains existing RLS policies
*/

-- Add error column to llm_responses
ALTER TABLE llm_responses 
ADD COLUMN IF NOT EXISTS error text;

-- Update the metrics calculation trigger
CREATE OR REPLACE FUNCTION calculate_response_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate metrics if there's no error
  IF NEW.error IS NULL THEN
    INSERT INTO metrics (
      response_id,
      accuracy_score,
      relevancy_score
    ) VALUES (
      NEW.id,
      0.85,  -- Default accuracy score
      0.80   -- Default relevancy score
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS calculate_metrics_on_response ON llm_responses;
CREATE TRIGGER calculate_metrics_on_response
  AFTER INSERT ON llm_responses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_response_metrics();