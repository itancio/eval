import { useState } from 'react';
import { metricsService } from '../lib/metrics/service';
import type { MetricsResult } from '../lib/metrics/types';

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMetrics = async (text: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = metricsService.calculateMetrics(text);
      setMetrics(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate metrics';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, calculateMetrics };
}