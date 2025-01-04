export const GROQ_CONFIG = {
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama3-8b-8192',
  defaultParams: {
    temperature: 1,
    top_p: 1,
    stream: false,
    stop: null
  }
} as const;