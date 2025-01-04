import { TextAnalyzer } from '../types';
import { normalizeScore } from './validation';

export function calculateMetricScore(analyzer: TextAnalyzer, text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  try {
    const rawScore = analyzer.analyze(text);
    return normalizeScore(rawScore);
  } catch (error) {
    console.error('Error calculating metric:', error);
    return 0;
  }
}