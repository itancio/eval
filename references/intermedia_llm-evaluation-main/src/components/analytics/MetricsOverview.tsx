import React from 'react';
import { BarChart, Activity, Clock } from 'lucide-react';
import type { Experiment } from '../../types/database';

interface MetricsOverviewProps {
  experiments: Experiment[];
}

export function MetricsOverview({ experiments }: MetricsOverviewProps) {
  const totalExperiments = experiments.length;
  const totalResponses = experiments.reduce(
    (sum, exp) => sum + (exp.llm_responses?.length || 0),
    0
  );
  
  const avgResponseTime = experiments.reduce((sum, exp) => {
    const validResponses = exp.llm_responses?.filter(resp => 
      typeof resp.response_time_ms === 'number' && !isNaN(resp.response_time_ms)
    ) || [];
    
    if (validResponses.length === 0) return sum;
    
    const experimentAvg = validResponses.reduce(
      (expSum, resp) => expSum + resp.response_time_ms,
      0
    ) / validResponses.length;
    
    return sum + experimentAvg;
  }, 0) / (experiments.filter(exp => exp.llm_responses?.length > 0).length || 1);

  const formatTime = (ms: number) => {
    if (isNaN(ms)) return 'N/A';
    return `${ms.toFixed(0)}ms`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Experiments</p>
            <p className="text-2xl font-semibold text-gray-900">{totalExperiments}</p>
          </div>
          <BarChart className="w-8 h-8 text-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Responses</p>
            <p className="text-2xl font-semibold text-gray-900">{totalResponses}</p>
          </div>
          <Activity className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatTime(avgResponseTime)}
            </p>
          </div>
          <Clock className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
}