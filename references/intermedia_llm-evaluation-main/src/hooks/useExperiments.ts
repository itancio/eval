import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Experiment } from '../types/database';

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = useCallback(async () => {
    try {
      console.log('Fetching experiments...');
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          llm_responses:llm_responses(
            id,
            experiment_id,
            llm_name,
            response_text,
            response_time_ms,
            error,
            metrics:metrics!inner(
              id,
              response_id,
              accuracy_score,
              relevancy_score,
              coherence_score,
              completeness_score
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching experiments:', error);
        throw error;
      }

      // Transform the data to ensure metrics are properly structured
      const transformedData = data?.map(experiment => ({
        ...experiment,
        llm_responses: experiment.llm_responses?.map(response => ({
          ...response,
          metrics: response.metrics?.[0] || {
            accuracy_score: 0,
            relevancy_score: 0,
            coherence_score: 0,
            completeness_score: 0
          }
        }))
      })) || [];

      console.log('Transformed experiments:', transformedData);
      setExperiments(transformedData);
    } catch (error) {
      console.error('Error in useExperiments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExperiment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .match({ id });

      if (error) throw error;
      
      setExperiments(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting experiment:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchExperiments();

    const handleExperimentCreated = () => {
      fetchExperiments();
    };

    window.addEventListener('experiment-created', handleExperimentCreated);
    return () => {
      window.removeEventListener('experiment-created', handleExperimentCreated);
    };
  }, [fetchExperiments]);

  return { experiments, loading, deleteExperiment, refreshExperiments: fetchExperiments };
}