import { LLMProvider, LLMRequest, LLMResponse } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
] as const;

export type GroqModel = (typeof GROQ_MODELS)[number];

export class GroqProvider implements LLMProvider {
  name = "groq";
  models = [...GROQ_MODELS];
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await fetch(GROQ_API_URL, {
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
      throw new Error(`Groq API error: ${response.status} - ${error}`);
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