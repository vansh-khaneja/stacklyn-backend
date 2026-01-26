import { config } from "dotenv";
config();

import { LLMProvider, LLMRequest, LLMResponse } from "./types";
import { GroqProvider, GROQ_MODELS } from "./groq.provider";
import { OpenAIProvider, OPENAI_MODELS } from "./openai.provider";
import { AnthropicProvider, ANTHROPIC_MODELS } from "./anthropic.provider";

export { LLMRequest, LLMResponse, LLMProvider } from "./types";

// Provider registry
const providers: Record<string, () => LLMProvider> = {
  groq: () => new GroqProvider(),
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
};

// Model to provider mapping
const modelToProvider: Record<string, string> = {};

// Register Groq models
GROQ_MODELS.forEach((model) => {
  modelToProvider[model] = "groq";
});

// Register OpenAI models
OPENAI_MODELS.forEach((model) => {
  modelToProvider[model] = "openai";
});

// Register Anthropic models
ANTHROPIC_MODELS.forEach((model) => {
  modelToProvider[model] = "anthropic";
});

// Get provider by name
export function getProvider(name: string): LLMProvider {
  const factory = providers[name];
  if (!factory) {
    throw new Error(`Unknown provider: ${name}. Available: ${Object.keys(providers).join(", ")}`);
  }
  return factory();
}

// Get provider by model name
export function getProviderForModel(model: string): LLMProvider {
  const providerName = modelToProvider[model];
  if (!providerName) {
    throw new Error(`Unknown model: ${model}`);
  }
  return getProvider(providerName);
}

// Main function to call LLM - auto-detects provider from model
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const provider = getProviderForModel(request.model);
  return provider.call(request);
}

// List all available models
export function getAvailableModels(): Record<string, string[]> {
  return {
    groq: [...GROQ_MODELS],
    openai: [...OPENAI_MODELS],
    anthropic: [...ANTHROPIC_MODELS],
  };
}

// Default model
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";
