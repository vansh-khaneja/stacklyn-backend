// Common types for all LLM providers

export interface LLMRequest {
  system_prompt: string;
  user_query: string;
  model: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  latency_ms: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMProvider {
  name: string;
  models: string[];
  call(request: LLMRequest): Promise<LLMResponse>;
}
