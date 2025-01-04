import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ExamplePrompts } from './ExamplePrompts';
import { useAuth } from '../hooks/useAuth';
import { useExperimentSubmit } from '../hooks/useExperimentSubmit';
import { ErrorMessage } from './ui/ErrorMessage';
import { PromptInput } from './experiment/PromptInput';
import { DescriptionInput } from './experiment/DescriptionInput';
import { SubmitButton } from './experiment/SubmitButton';

export function ExperimentForm() {
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const { isLoading, error, submitExperiment } = useExperimentSubmit();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await submitExperiment({ prompt, description });
    setPrompt('');
    setDescription('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
        {error && <ErrorMessage message={error} />}
        <PromptInput value={prompt} onChange={setPrompt} />
        <DescriptionInput value={description} onChange={setDescription} />
        <SubmitButton isLoading={isLoading} />
      </form>

      <div className="md:col-span-1">
        <ExamplePrompts onSelect={setPrompt} />
      </div>
    </div>
  );
}