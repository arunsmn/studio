import Anthropic from "@anthropic-ai/sdk";
import type { ImageMimeType } from "./types";

export async function claudeVisionProvider(
  prompt: string,
  imageBase64: string,
  mimeType: ImageMimeType
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const block = message.content[0];
    if (!block || block.type !== "text") {
      throw new Error("PROVIDER_FAILED");
    }
    return block.text;
  } catch {
    throw new Error("PROVIDER_FAILED");
  }
}
