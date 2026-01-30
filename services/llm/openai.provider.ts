import { LLMProvider, LLMRequest, LLMResponse } from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    const startTime = Date.now();

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          { role: "system", content: request.system_prompt },
          { role: "user", content: request.user_query },
        ],
      }),
    });

    const latency_ms = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: request.model,
      latency_ms,
      token_usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
    };
  }
}
