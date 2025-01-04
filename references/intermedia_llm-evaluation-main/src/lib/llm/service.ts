import { LLMProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { GroqProvider } from './providers/groq/provider';
import { MetricsCalculator } from '../metrics/calculator';

export class LLMService {
  private providers: LLMProvider[] = [];
  private metricsCalculator: MetricsCalculator;

  constructor() {
    this.metricsCalculator = new MetricsCalculator();
    
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.providers.push(new GeminiProvider(import.meta.env.VITE_GEMINI_API_KEY));
    }
    if (import.meta.env.VITE_GROQ_API_KEY) {
      this.providers.push(new GroqProvider(import.meta.env.VITE_GROQ_API_KEY));
    }
  }

  async generateResponses(prompt: string) {
    return Promise.all(
      this.providers.map(async (provider) => {
        try {
          console.log(`Generating response for ${provider.name}...`);
          const response = await provider.generateResponse(prompt);
          
          if (!response.text) {
            console.log(`No text response from ${provider.name}`);
            return {
              provider: provider.name,
              text: null,
              timeMs: 0,
              metrics: null,
              error: 'No response generated'
            };
          }

          console.log(`Calculating metrics for ${provider.name}...`);
          const metrics = this.metricsCalculator.calculateMetrics(response.text);
          
          console.log(`${provider.name} metrics:`, metrics);
          
          return {
            provider: provider.name,
            text: response.text,
            timeMs: response.timeMs,
            metrics,
            error: null
          };
        } catch (error) {
          console.error(`Error with ${provider.name}:`, error);
          return {
            provider: provider.name,
            text: null,
            timeMs: 0,
            metrics: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
  }
}