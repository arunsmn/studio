import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ImageMimeType } from "./types";

export async function geminiVisionProvider(
  prompt: string,
  imageBase64: string,
  mimeType: ImageMimeType
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([
      { inlineData: { mimeType, data: imageBase64 } },
      prompt,
    ]);
    return result.response.text();
  } catch {
    throw new Error("PROVIDER_FAILED");
  }
}
