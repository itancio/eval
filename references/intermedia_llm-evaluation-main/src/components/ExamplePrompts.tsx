import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExamplePrompt {
  title: string;
  prompt: string;
  description: string;
}

const examples: ExamplePrompt[] = [
  {
    title: "Code Review Assistant",
    prompt: `You are a senior software engineer conducting a code review. Review the following code for:
1. Potential bugs and edge cases
2. Performance optimizations
3. Security vulnerabilities
4. Code style and best practices

Code to review:
\`\`\`javascript
function processUserData(data) {
  let results = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].age > 18) {
      results.push({
        name: data[i].name,
        email: data[i].email,
        isActive: data[i].status == 'active'
      });
    }
  }
  return results;
}
\`\`\``,
    description: "Tests LLM's ability to perform technical code review and identify common issues"
  }
];

export function ExamplePrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Lightbulb className="w-4 h-4" />
        <span>Example prompts to get started</span>
      </div>
      {examples.map((example) => (
        <div
          key={example.title}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:border-indigo-100 cursor-pointer transition-colors"
          onClick={() => onSelect(example.prompt)}
        >
          <h3 className="font-medium text-gray-900">{example.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{example.description}</p>
        </div>
      ))}
    </div>
  );
}