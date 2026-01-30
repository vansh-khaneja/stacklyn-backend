import { LLMProvider, LLMRequest, LLMResponse } from "./types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  models = [...GEMINI_MODELS];
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await fetch(
      `${GEMINI_API_URL}/${request.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.system_prompt }],
          },
          contents: [
            {
              parts: [{ text: request.user_query }],
            },
          ],
        }),
      }
    );

    const latency_ms = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const usageMetadata = data.usageMetadata || {};

    return {
      content,
      model: request.model,
      latency_ms,
      token_usage: {
        prompt_tokens: usageMetadata.promptTokenCount || 0,
        completion_tokens: usageMetadata.candidatesTokenCount || 0,
        total_tokens: usageMetadata.totalTokenCount || 0,
      },
    };
  }
}
