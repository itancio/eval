import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Experiment } from '../../types/database';

interface PerformanceChartProps {
  experiments: Experiment[];
}

export function PerformanceChart({ experiments }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    return experiments.map(exp => {
      const metrics = exp.llm_responses?.reduce(
        (acc, resp) => {
          if (resp.metrics) {
            // Only count valid numeric scores
            if (typeof resp.metrics.accuracy_score === 'number') {
              acc.accuracy.sum += resp.metrics.accuracy_score;
              acc.accuracy.count++;
            }
            if (typeof resp.metrics.relevancy_score === 'number') {
              acc.relevancy.sum += resp.metrics.relevancy_score;
              acc.relevancy.count++;
            }
            if (typeof resp.metrics.coherence_score === 'number') {
              acc.coherence.sum += resp.metrics.coherence_score;
              acc.coherence.count++;
            }
            if (typeof resp.metrics.completeness_score === 'number') {
              acc.completeness.sum += resp.metrics.completeness_score;
              acc.completeness.count++;
            }
          }
          return acc;
        },
        {
          accuracy: { sum: 0, count: 0 },
          relevancy: { sum: 0, count: 0 },
          coherence: { sum: 0, count: 0 },
          completeness: { sum: 0, count: 0 }
        }
      );

      return {
        timestamp: exp.created_at,
        accuracy: metrics?.accuracy.count ? metrics.accuracy.sum / metrics.accuracy.count : null,
        relevancy: metrics?.relevancy.count ? metrics.relevancy.sum / metrics.relevancy.count : null,
        coherence: metrics?.coherence.count ? metrics.coherence.sum / metrics.coherence.count : null,
        completeness: metrics?.completeness.count ? metrics.completeness.sum / metrics.completeness.count : null
      };
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [experiments]);

  const metrics = [
    { key: 'accuracy', name: 'Accuracy', color: '#4f46e5' },
    { key: 'relevancy', name: 'Relevancy', color: '#10b981' },
    { key: 'coherence', name: 'Coherence', color: '#f59e0b' },
    { key: 'completeness', name: 'Completeness', color: '#8b5cf6' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              domain={[0, 1]} 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip
              formatter={(value: number | null) => 
                value !== null ? `${(value * 100).toFixed(1)}%` : 'N/A'
              }
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Legend />
            {metrics.map(({ key, name, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}