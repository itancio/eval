export interface MetricsResult {
  accuracy_score: number;    // Changed from number | null
  relevancy_score: number;   // Changed from number | null
  coherence_score: number;   // Changed from number | null
  completeness_score: number; // Changed from number | null
}

export interface TextAnalyzer {
  analyze(text: string): number;
}

export interface MetricsProvider {
  calculateMetrics(text: string): MetricsResult;
}