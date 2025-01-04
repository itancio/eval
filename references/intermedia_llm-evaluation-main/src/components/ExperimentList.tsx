import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ResponseComparison } from './ResponseComparison';
import type { Experiment } from '../types/database';

export function ExperimentList() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiments() {
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          llm_responses (
            *,
            metrics (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setExperiments(data);
      }
      setLoading(false);
    }

    fetchExperiments();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading experiments...</div>;
  }

  return (
    <div className="space-y-8">
      {experiments.map((experiment) => (
        <div key={experiment.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Prompt</h3>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{experiment.prompt}</p>
            {experiment.description && (
              <p className="mt-2 text-sm text-gray-500">{experiment.description}</p>
            )}
          </div>
          <ResponseComparison responses={experiment.llm_responses} />
        </div>
      ))}
    </div>
  );
}