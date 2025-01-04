export interface Experiment {
  id: string;
  user_id: string;
  prompt: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  llm_responses?: LLMResponse[];
}

export interface LLMResponse {
  id: string;
  experiment_id: string;
  llm_name: string;
  response_text: string;
  response_time_ms: number;
  error?: string | null;
  created_at: string;
  metrics?: Metrics;
}

export interface Metrics {
  id: string;
  response_id: string;
  accuracy_score: number;    // Changed from number | null
  relevancy_score: number;   // Changed from number | null
  coherence_score: number;   // Changed from number | null
  completeness_score: number; // Changed from number | null
  created_at: string;
}