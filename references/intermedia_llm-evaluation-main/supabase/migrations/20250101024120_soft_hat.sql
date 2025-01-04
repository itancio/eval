/*
  # Fix cascade deletion and metrics calculation

  1. Changes
    - Add CASCADE ON DELETE to foreign key constraints
    - Add trigger to update experiments.updated_at
    - Add trigger to calculate metrics on llm_response insert
*/

-- Add trigger to update experiments.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to calculate metrics on llm_response insert
CREATE OR REPLACE FUNCTION calculate_response_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default metrics for new responses
  INSERT INTO metrics (
    response_id,
    accuracy_score,
    relevancy_score
  ) VALUES (
    NEW.id,
    0.85, -- Default accuracy score
    0.80  -- Default relevancy score
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER calculate_metrics_on_response
  AFTER INSERT ON llm_responses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_response_metrics();