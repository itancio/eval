/*
  # Initial Schema for LLM Evaluation Platform

  1. New Tables
    - `experiments`
      - Stores experiment metadata and settings
      - Contains prompt, timestamp, and user information
    - `llm_responses`
      - Stores individual LLM responses for each experiment
      - Includes performance metrics and response data
    - `metrics`
      - Stores calculated metrics for each response
      - Includes accuracy, relevancy, and timing data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  prompt text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- LLM Responses table
CREATE TABLE IF NOT EXISTS llm_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES experiments(id) ON DELETE CASCADE,
  llm_name text NOT NULL,
  response_text text NOT NULL,
  response_time_ms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES llm_responses(id) ON DELETE CASCADE,
  accuracy_score float CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  relevancy_score float CHECK (relevancy_score >= 0 AND relevancy_score <= 1),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Policies for experiments
CREATE POLICY "Users can create their own experiments"
  ON experiments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own experiments"
  ON experiments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON experiments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for llm_responses
CREATE POLICY "Users can view responses for their experiments"
  ON llm_responses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM experiments
    WHERE experiments.id = llm_responses.experiment_id
    AND experiments.user_id = auth.uid()
  ));

CREATE POLICY "Users can create responses for their experiments"
  ON llm_responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM experiments
    WHERE experiments.id = llm_responses.experiment_id
    AND experiments.user_id = auth.uid()
  ));

-- Policies for metrics
CREATE POLICY "Users can view metrics for their responses"
  ON metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM llm_responses
    JOIN experiments ON experiments.id = llm_responses.experiment_id
    WHERE llm_responses.id = metrics.response_id
    AND experiments.user_id = auth.uid()
  ));

CREATE POLICY "Users can create metrics for their responses"
  ON metrics FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM llm_responses
    JOIN experiments ON experiments.id = llm_responses.experiment_id
    WHERE llm_responses.id = metrics.response_id
    AND experiments.user_id = auth.uid()
  ));