import { LLMProvider, LLMRequest, LLMResponse } from "./types";

// TODO: npm install openai
// const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const OPENAI_MODELS = [
  "gpt-4.1-2025-04-14",
  "gpt-4o-mini-2024-07-18",
] as const;

export type OpenAIModel = (typeof OPENAI_MODELS)[number];

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  models = [...OPENAI_MODELS];
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    // TODO: Implement OpenAI API call
    throw new Error("OpenAI provider not implemented yet");
  }
}
