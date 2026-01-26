import { LLMProvider, LLMRequest, LLMResponse } from "./types";

// TODO: npm install @anthropic-ai/sdk
// const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
] as const;

export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  models = [...ANTHROPIC_MODELS];
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required");
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    // TODO: Implement Anthropic API call
    throw new Error("Anthropic provider not implemented yet");
  }
}
