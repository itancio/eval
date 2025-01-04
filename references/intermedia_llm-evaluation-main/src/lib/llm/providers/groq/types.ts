export interface GroqRequestConfig {
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  stop: string[] | null;
}

export interface GroqResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}