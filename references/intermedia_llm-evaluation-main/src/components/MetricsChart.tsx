import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricsChartProps {
  data: Array<{
    timestamp: string;
    llm: string;
    accuracy: number;
    relevancy: number;
  }>;
}

export function MetricsChart({ data }: MetricsChartProps) {
  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-md p-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
          <Tooltip
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            name="Accuracy"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="relevancy"
            stroke="#10b981"
            name="Relevancy"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}