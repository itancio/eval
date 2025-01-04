import React from 'react';

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Description (optional)
      </label>
      <input
        type="text"
        id="description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-100 dark:placeholder-gray-400"
      />
    </div>
  );
}