import React from 'react';
import type { Experiment } from '../../types/database';

interface ModelComparisonProps {
  experiments: Experiment[];
}

export function ModelComparison({ experiments }: ModelComparisonProps) {
  const modelStats = experiments.reduce((stats, exp) => {
    exp.llm_responses?.forEach(resp => {
      if (!stats[resp.llm_name]) {
        stats[resp.llm_name] = {
          totalResponses: 0,
          totalTime: 0,
          totalAccuracy: 0,
          totalRelevancy: 0,
          successfulResponses: 0,
          validTimeResponses: 0
        };
      }

      stats[resp.llm_name].totalResponses += 1;
      
      if (typeof resp.response_time_ms === 'number' && !isNaN(resp.response_time_ms)) {
        stats[resp.llm_name].totalTime += resp.response_time_ms;
        stats[resp.llm_name].validTimeResponses += 1;
      }

      if (resp.metrics) {
        if (typeof resp.metrics.accuracy_score === 'number' && !isNaN(resp.metrics.accuracy_score)) {
          stats[resp.llm_name].totalAccuracy += resp.metrics.accuracy_score;
        }
        if (typeof resp.metrics.relevancy_score === 'number' && !isNaN(resp.metrics.relevancy_score)) {
          stats[resp.llm_name].totalRelevancy += resp.metrics.relevancy_score;
        }
        stats[resp.llm_name].successfulResponses += 1;
      }
    });
    return stats;
  }, {} as Record<string, {
    totalResponses: number;
    totalTime: number;
    totalAccuracy: number;
    totalRelevancy: number;
    successfulResponses: number;
    validTimeResponses: number;
  }>);

  const formatMetric = (value: number, total: number) => {
    if (total === 0) return 'N/A';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const formatTime = (total: number, count: number) => {
    if (count === 0) return 'N/A';
    return `${(total / count).toFixed(0)}ms`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Accuracy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Relevancy
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(modelStats).map(([model, stats]) => (
              <tr key={model}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stats.totalResponses}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(stats.totalTime, stats.validTimeResponses)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatMetric(stats.totalAccuracy, stats.successfulResponses)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatMetric(stats.totalRelevancy, stats.successfulResponses)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}