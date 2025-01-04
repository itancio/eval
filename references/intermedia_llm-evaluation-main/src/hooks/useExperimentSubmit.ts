import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LLMService } from '../lib/llm/service';
import { useAuth } from './useAuth';

const llmService = new LLMService();

interface ExperimentSubmitParams {
  prompt: string;
  description: string;
}

export function useExperimentSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const submitExperiment = async ({ prompt, description }: ExperimentSubmitParams) => {
    if (!user) {
      setError('You must be logged in to create experiments');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating experiment...');
      const { data: experiment, error: experimentError } = await supabase
        .from('experiments')
        .insert([{ 
          prompt, 
          description,
          user_id: user.id
        }])
        .select()
        .single();

      if (experimentError) throw experimentError;

      console.log('Generating responses...');
      const responses = await llmService.generateResponses(prompt);
      console.log('Generated responses:', responses);

      for (const response of responses) {
        console.log(`Processing response from ${response.provider}...`);
        
        // Skip if no response was generated
        if (!response.text && !response.error) {
          console.log(`Skipping empty response from ${response.provider}`);
          continue;
        }

        // Insert LLM response
        console.log(`Inserting response for ${response.provider}...`);
        const { data: llmResponse, error: responseError } = await supabase
          .from('llm_responses')
          .insert({
            experiment_id: experiment.id,
            llm_name: response.provider,
            response_text: response.text || '',
            response_time_ms: response.timeMs,
            error: response.error
          })
          .select()
          .single();

        if (responseError) {
          console.error('Error inserting response:', responseError);
          throw responseError;
        }

        // Insert metrics if available
        if (response.metrics && !response.error) {
          console.log(`Inserting metrics for ${response.provider}...`, response.metrics);
          const { error: metricsError } = await supabase
            .from('metrics')
            .insert({
              response_id: llmResponse.id,
              accuracy_score: response.metrics.accuracy_score || 0,
              relevancy_score: response.metrics.relevancy_score || 0,
              coherence_score: response.metrics.coherence_score || 0,
              completeness_score: response.metrics.completeness_score || 0
            });

          if (metricsError) {
            console.error('Error inserting metrics:', metricsError);
            throw metricsError;
          }
        }
      }

      // Refresh experiments without page reload
      window.dispatchEvent(new CustomEvent('experiment-created'));
    } catch (error) {
      console.error('Error in experiment submission:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, submitExperiment };
}