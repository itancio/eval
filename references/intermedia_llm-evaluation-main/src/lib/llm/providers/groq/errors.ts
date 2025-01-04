export class GroqError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'GroqError';
  }

  static fromResponse(response: Response, data: any): GroqError {
    const message = data?.error?.message || response.statusText || 'Unknown Groq API error';
    return new GroqError(message, response.status, data?.error?.code);
  }

  static fromError(error: unknown): GroqError {
    if (error instanceof GroqError) return error;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new GroqError(message);
  }
}