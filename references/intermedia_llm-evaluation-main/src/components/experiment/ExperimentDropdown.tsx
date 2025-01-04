import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResponseComparison } from '../ResponseComparison';
import type { Experiment } from '../../types/database';

interface ExperimentDropdownProps {
  experiment: Experiment;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function ExperimentDropdown({ experiment, onDelete, isDeleting }: ExperimentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const date = new Date(experiment.created_at).toLocaleDateString();
  const time = new Date(experiment.created_at).toLocaleTimeString();
  
  const title = experiment.description 
    ? `${experiment.description} - ${date} ${time}`
    : `Prompt - ${date} ${time}`;

  return (
    <div className="bg-white dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prompt</h4>
            <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{experiment.prompt}</p>
          </div>
          
          {experiment.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{experiment.description}</p>
            </div>
          )}
          
          <div className="mt-6">
            <ResponseComparison responses={experiment.llm_responses} />
          </div>
        </div>
      )}
    </div>
  );
}