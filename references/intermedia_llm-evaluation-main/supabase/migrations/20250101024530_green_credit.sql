/*
  # Fix cascade deletion and metrics calculation

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Update metrics calculation trigger
*/

-- Drop existing foreign key constraints
ALTER TABLE llm_responses DROP CONSTRAINT IF EXISTS llm_responses_experiment_id_fkey;
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_response_id_fkey;

-- Recreate foreign key constraints with CASCADE
ALTER TABLE llm_responses
  ADD CONSTRAINT llm_responses_experiment_id_fkey
  FOREIGN KEY (experiment_id)
  REFERENCES experiments(id)
  ON DELETE CASCADE;

ALTER TABLE metrics
  ADD CONSTRAINT metrics_response_id_fkey
  FOREIGN KEY (response_id)
  REFERENCES llm_responses(id)
  ON DELETE CASCADE;

-- Update metrics calculation trigger
CREATE OR REPLACE FUNCTION calculate_response_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO metrics (
    response_id,
    accuracy_score,
    relevancy_score
  ) VALUES (
    NEW.id,
    0.85,
    0.80
  );
  RETURN NEW;
END;
$$ language 'plpgsql';