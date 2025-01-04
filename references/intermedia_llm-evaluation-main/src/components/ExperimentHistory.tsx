import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ExperimentDropdown } from './experiment/ExperimentDropdown';
import { useExperiments } from '../hooks/useExperiments';

export function ExperimentHistory() {
  const { experiments, loading, deleteExperiment } = useExperiments();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    if (deletingIds.has(id)) return;
    
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      await deleteExperiment(id);
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (experiments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No experiments found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Experiment History</h2>
      {experiments.map((experiment) => (
        <ExperimentDropdown
          key={experiment.id}
          experiment={experiment}
          onDelete={handleDelete}
          isDeleting={deletingIds.has(experiment.id)}
        />
      ))}
    </div>
  );
}