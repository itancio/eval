import { LLMProvider, LLMResponse, LLMError } from '../types';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name = 'GPT-4';

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const timeMs = Date.now() - startTime;

      return {
        text: data.choices[0].message.content,
        timeMs
      };
    } catch (error) {
      const llmError = new Error(error instanceof Error ? error.message : 'Unknown error') as LLMError;
      llmError.provider = this.name;
      throw llmError;
    }
  }
}