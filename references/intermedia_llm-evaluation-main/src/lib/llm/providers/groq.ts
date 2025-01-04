import { LLMProvider, LLMResponse, LLMError } from '../types';

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  name = 'Llama 3.1';

  async generateResponse(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Groq API key is not configured');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ 
            role: 'user', 
            content: prompt 
          }],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Groq API');
      }

      return {
        text: data.choices[0].message.content,
        timeMs: Date.now() - startTime
      };
    } catch (error) {
      console.error('Groq API error details:', error);
      const llmError = new Error(
        error instanceof Error 
          ? error.message 
          : 'Unknown error with Groq API'
      ) as LLMError;
      llmError.provider = this.name;
      throw llmError;
    }
  }
}