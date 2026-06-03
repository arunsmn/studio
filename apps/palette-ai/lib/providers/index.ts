import { claudeProvider, geminiProvider } from "@studio/ai-core";
import { buildPrompt } from "../buildPrompt";
import { parseColours } from "../parseColours";
import type { Colour, PaletteOptions } from "../types";

const STRICT_SUFFIX =
  "\n\nIMPORTANT: Return ONLY the JSON array. No other text whatsoever.";

export async function generatePalette(options: PaletteOptions): Promise<Colour[]> {
  const provider = options.model === "claude" ? claudeProvider : geminiProvider;
  const prompt = buildPrompt(options);

  const raw = await provider(prompt);

  try {
    return parseColours(raw, options.count);
  } catch {
    const retryRaw = await provider(prompt + STRICT_SUFFIX);
    return parseColours(retryRaw, options.count);
  }
}
