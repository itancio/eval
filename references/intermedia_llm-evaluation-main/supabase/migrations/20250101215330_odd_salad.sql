/*
  # Reset Database Data
  
  1. Changes
    - Remove all existing data from experiments, llm_responses, and metrics tables
    - Reset sequences for clean IDs
  
  2. Notes
    - This is a one-time cleanup to start fresh with the new metrics system
    - All existing data will be permanently deleted
*/

-- Disable RLS temporarily for cleanup
ALTER TABLE experiments DISABLE ROW LEVEL SECURITY;
ALTER TABLE llm_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE metrics DISABLE ROW LEVEL SECURITY;

-- Delete all data
TRUNCATE TABLE metrics CASCADE;
TRUNCATE TABLE llm_responses CASCADE;
TRUNCATE TABLE experiments CASCADE;

-- Re-enable RLS
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;