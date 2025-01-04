import { MetricsResult } from './types';
import { AccuracyAnalyzer } from './analyzers/accuracy';
import { RelevancyAnalyzer } from './analyzers/relevancy';
import { CoherenceAnalyzer } from './analyzers/coherence';
import { CompletenessAnalyzer } from './analyzers/completeness';
import { calculateMetricScore } from './utils/scoreCalculator';
import { validateText, createEmptyMetrics } from './utils/validation';

export class MetricsCalculator {
  private analyzers = {
    accuracy: new AccuracyAnalyzer(),
    relevancy: new RelevancyAnalyzer(),
    coherence: new CoherenceAnalyzer(),
    completeness: new CompletenessAnalyzer()
  };

  calculateMetrics(text: string): MetricsResult {
    if (!validateText(text)) {
      console.log('Invalid text for metrics calculation:', text);
      return createEmptyMetrics();
    }

    try {
      const metrics = {
        accuracy_score: calculateMetricScore(this.analyzers.accuracy, text),
        relevancy_score: calculateMetricScore(this.analyzers.relevancy, text),
        coherence_score: calculateMetricScore(this.analyzers.coherence, text),
        completeness_score: calculateMetricScore(this.analyzers.completeness, text)
      };

      console.log('Calculated metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return createEmptyMetrics();
    }
  }
}