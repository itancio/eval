import { GroqRequestConfig, GroqResponse } from './types';
import { GROQ_CONFIG } from './config';
import { GroqError } from './errors';

export class GroqAPI {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new GroqError('Groq API key is required');
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async request(prompt: string): Promise<GroqResponse> {
    try {
      const response = await fetch(GROQ_CONFIG.apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides clear and concise responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: GROQ_CONFIG.model,
          ...GROQ_CONFIG.defaultParams
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API error:', errorData);
        throw new GroqError(
          errorData.error?.message || `HTTP error ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Groq API request failed:', error);
      throw error instanceof GroqError ? error : GroqError.fromError(error);
    }
  }
}