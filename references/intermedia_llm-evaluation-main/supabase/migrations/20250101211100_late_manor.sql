/*
  # Remove automatic metrics calculation

  1. Changes
    - Remove automatic metrics calculation trigger and function
    - Keep all existing metrics data
    - Keep all constraints and indexes
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS calculate_metrics_on_response ON llm_responses;
DROP FUNCTION IF EXISTS calculate_response_metrics;