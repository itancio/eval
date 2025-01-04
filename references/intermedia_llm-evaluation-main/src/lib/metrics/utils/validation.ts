export function validateText(text: string | null | undefined): text is string {
  return typeof text === 'string' && text.trim().length > 0;
}

export function normalizeScore(score: number): number {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  return Math.min(Math.max(score, 0), 1);
}

export function createEmptyMetrics(): MetricsResult {
  return {
    accuracy_score: 0,
    relevancy_score: 0,
    coherence_score: 0,
    completeness_score: 0
  };
}