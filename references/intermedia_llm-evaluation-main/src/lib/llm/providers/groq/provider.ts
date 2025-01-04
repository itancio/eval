import { LLMProvider, LLMResponse, LLMError } from '../../types';
import { GroqAPI } from './api';
import { GroqError } from './errors';

export class GroqProvider implements LLMProvider {
  private api: GroqAPI;
  
  constructor(apiKey: string) {
    this.api = new GroqAPI(apiKey);
  }

  name = 'Llama 3';

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await this.api.request(prompt);
      
      if (!response.choices?.[0]?.message?.content) {
        throw new GroqError('Invalid response format from Groq API');
      }

      return {
        text: response.choices[0].message.content,
        timeMs: Date.now() - startTime
      };
    } catch (error) {
      const llmError = error instanceof GroqError 
        ? new Error(error.message) as LLMError
        : new Error('Unknown error with Groq API') as LLMError;
      
      llmError.provider = this.name;
      throw llmError;
    }
  }
}