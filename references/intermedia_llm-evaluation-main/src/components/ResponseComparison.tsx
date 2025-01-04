import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { MetricsDisplay } from './metrics/MetricsDisplay';
import type { LLMResponse } from '../types/database';

interface ResponseComparisonProps {
  responses: LLMResponse[];
}

export function ResponseComparison({ responses }: ResponseComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {responses.map((response) => (
        <div
          key={response.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {response.llm_name}
            </h3>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{response.response_time_ms}ms</span>
            </div>
          </div>

          {response.error ? (
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p>{response.error}</p>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {response.response_text}
            </p>
          )}

          {!response.error && response.metrics && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <MetricsDisplay metrics={response.metrics} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}