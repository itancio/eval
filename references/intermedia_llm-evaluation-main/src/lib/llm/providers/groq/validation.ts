import { GroqResponse, GroqRequestConfig } from './types';
import { GroqError } from './errors';

export class RequestValidator {
  static validateConfig(config: GroqRequestConfig) {
    if (!config.model) {
      throw new GroqError('Model is required');
    }
    if (!config.messages?.length) {
      throw new GroqError('Messages array cannot be empty');
    }
    if (!config.messages[0]?.content) {
      throw new GroqError('Message content is required');
    }
  }
}

export class ResponseValidator {
  static validateResponse(data: any): asserts data is GroqResponse {
    if (!data) {
      throw new GroqError('Empty response from Groq API');
    }
    if (!Array.isArray(data.choices)) {
      throw new GroqError('Invalid response format: choices array is missing');
    }
    if (!data.choices[0]?.message?.content) {
      throw new GroqError('Invalid response format: message content is missing');
    }
  }
}