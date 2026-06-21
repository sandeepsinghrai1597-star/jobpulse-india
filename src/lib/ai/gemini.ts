import "server-only";
import { GoogleGenAI } from "@google/genai";
import { aiPrompts } from "@/lib/ai/prompts";

let client: GoogleGenAI | null = null;
const GEMINI_TIMEOUT_MS = 15000;

function getClient() {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new GoogleGenAI({
      apiKey,
    });
  }
  return client;
}

export async function generateStructuredAiResponse(
  promptKey: keyof typeof aiPrompts,
  payload: Record<string, unknown>,
) {
  const ai = getClient();
  if (!ai) {
    return {
      provider: "mock",
      data: payload,
      note: "Gemini key missing. Returning safe mock response for local development.",
    };
  }

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${aiPrompts[promptKey]}\n\nInput JSON:\n${JSON.stringify(payload)}`,
        config: {
          responseMimeType: "application/json",
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Gemini request timed out.")),
          GEMINI_TIMEOUT_MS,
        ),
      ),
    ]);

    return JSON.parse(response.text ?? "{}");
  } catch (error) {
    return {
      provider: "fallback",
      data: payload,
      note:
        error instanceof Error
          ? `Gemini request failed: ${error.message}`
          : "Gemini request failed. Returning safe fallback response.",
    };
  }
}
