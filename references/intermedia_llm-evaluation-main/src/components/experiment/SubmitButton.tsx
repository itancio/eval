import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
}

export function SubmitButton({ isLoading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating Responses...
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Create Experiment
        </>
      )}
    </button>
  );
}