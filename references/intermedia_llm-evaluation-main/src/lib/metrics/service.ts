import { MetricsCalculator } from './calculator';
import type { MetricsResult } from './types';

class MetricsService {
  private calculator: MetricsCalculator;

  constructor() {
    this.calculator = new MetricsCalculator();
  }

  calculateMetrics(text: string): MetricsResult {
    return this.calculator.calculateMetrics(text);
  }
}

export const metricsService = new MetricsService();