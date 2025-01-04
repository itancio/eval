import { LLMProvider, LLMResponse, LLMError } from '../types';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name = 'Claude';

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const timeMs = Date.now() - startTime;

      return {
        text: data.content[0].text,
        timeMs
      };
    } catch (error) {
      const llmError = new Error(error instanceof Error ? error.message : 'Unknown error') as LLMError;
      llmError.provider = this.name;
      throw llmError;
    }
  }
}