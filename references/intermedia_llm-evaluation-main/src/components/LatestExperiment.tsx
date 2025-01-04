import React from 'react';
import { ResponseComparison } from './ResponseComparison';
import { useExperiments } from '../hooks/useExperiments';

export function LatestExperiment() {
  const { experiments, loading } = useExperiments();
  const latestExperiment = experiments[0];

  if (loading) {
    return <div className="text-center py-8">Loading latest experiment...</div>;
  }

  if (!latestExperiment) {
    return (
      <div className="text-center py-8 text-gray-500">
        No experiments yet. Create one above!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Latest Result</h3>
        <p className="mt-1 text-gray-600 whitespace-pre-wrap">{latestExperiment.prompt}</p>
        {latestExperiment.description && (
          <p className="mt-2 text-sm text-gray-500">{latestExperiment.description}</p>
        )}
      </div>
      <ResponseComparison responses={latestExperiment.llm_responses} />
    </div>
  );
}