export interface LLMProvider {
  name: string;
  generateResponse: (prompt: string) => Promise<LLMResponse>;
}

export interface LLMResponse {
  text: string;
  timeMs: number;
}

export interface LLMError extends Error {
  provider: string;
  status?: number;
}