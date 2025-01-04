import React from 'react';
import { Brain, ThumbsUp, Zap, CheckCircle } from 'lucide-react';
import type { MetricsResult } from '../../lib/metrics/types';

interface MetricsDisplayProps {
  metrics: MetricsResult;
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const formatMetric = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricItem
        icon={<Brain className="w-4 h-4 mr-2 text-blue-500" />}
        label="Accuracy"
        value={formatMetric(metrics.accuracy_score)}
      />
      <MetricItem
        icon={<ThumbsUp className="w-4 h-4 mr-2 text-green-500" />}
        label="Relevancy"
        value={formatMetric(metrics.relevancy_score)}
      />
      <MetricItem
        icon={<Zap className="w-4 h-4 mr-2 text-yellow-500" />}
        label="Coherence"
        value={formatMetric(metrics.coherence_score)}
      />
      <MetricItem
        icon={<CheckCircle className="w-4 h-4 mr-2 text-purple-500" />}
        label="Completeness"
        value={formatMetric(metrics.completeness_score)}
      />
    </div>
  );
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetricItem({ icon, label, value }: MetricItemProps) {
  return (
    <div className="flex items-center">
      {icon}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}