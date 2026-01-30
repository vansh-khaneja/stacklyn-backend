import { config } from "dotenv";
config();

import { LLMProvider, LLMRequest, LLMResponse } from "./types";
import { GroqProvider, GROQ_MODELS } from "./groq.provider";
import { OpenAIProvider, OPENAI_MODELS } from "./openai.provider";
import { AnthropicProvider, ANTHROPIC_MODELS } from "./anthropic.provider";
import { GeminiProvider, GEMINI_MODELS } from "./gemini.provider";
import modelMetadata from "../../config/model-metadata.json";

export { LLMRequest, LLMResponse, LLMProvider } from "./types";

interface ModelInfo {
  id: string;
  name: string;
  icon: string;
}

// Provider registry
const providers: Record<string, () => LLMProvider> = {
  groq: () => new GroqProvider(),
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
  gemini: () => new GeminiProvider(),
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

// Register Gemini models
GEMINI_MODELS.forEach((model) => {
  modelToProvider[model] = "gemini";
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

// Helper to get model info with name and icon
function getModelInfo(modelId: string): ModelInfo {
  const models = modelMetadata.models as Record<string, { name: string; icon: string }>;
  const icons = modelMetadata.icons as Record<string, string>;

  const meta = models[modelId] || { name: modelId, icon: "default" };
  const iconUrl = icons[meta.icon] || "";

  return {
    id: modelId,
    name: meta.name,
    icon: iconUrl,
  };
}

// List all available models with metadata
export function getAvailableModels(): Record<string, ModelInfo[]> {
  return {
    groq: GROQ_MODELS.map(getModelInfo),
    openai: OPENAI_MODELS.map(getModelInfo),
    anthropic: ANTHROPIC_MODELS.map(getModelInfo),
    gemini: GEMINI_MODELS.map(getModelInfo),
  };
}

// Default model
export const DEFAULT_MODEL = "llama-3.3-70b-versatile";
