import React from 'react';
import { MetricsOverview } from './MetricsOverview';
import { PerformanceChart } from './PerformanceChart';
import { ModelComparison } from './ModelComparison';
import { useExperiments } from '../../hooks/useExperiments';

export function Dashboard() {
  const { experiments, loading } = useExperiments();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MetricsOverview experiments={experiments} />
      <div className="grid grid-cols-1 gap-8">
        <PerformanceChart experiments={experiments} />
        <ModelComparison experiments={experiments} />
      </div>
    </div>
  );
}