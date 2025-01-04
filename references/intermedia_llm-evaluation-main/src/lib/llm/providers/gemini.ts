import { LLMProvider, LLMResponse, LLMError } from '../types';

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name = 'Gemini Pro';

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const timeMs = Date.now() - startTime;

      return {
        text: data.candidates[0].content.parts[0].text,
        timeMs
      };
    } catch (error) {
      const llmError = new Error(error instanceof Error ? error.message : 'Unknown error') as LLMError;
      llmError.provider = this.name;
      throw llmError;
    }
  }
}