import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div>
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Prompt
      </label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full p-2 rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-100 dark:placeholder-gray-400"
        rows={8}
        required
      />
    </div>
  );
}