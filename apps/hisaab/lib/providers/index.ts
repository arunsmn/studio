import { claudeProvider, geminiProvider } from "@studio/ai-core";
import { buildExpensePrompt } from "@/lib/buildExpensePrompt";
import { parseExpense } from "@/lib/parseExpense";
import type { AIModel, ParsedExpense } from "@/lib/types";

interface GenerateOptions {
  message: string;
  currency: string;
  model: AIModel;
}

export async function generateParsedExpense(
  options: GenerateOptions,
): Promise<ParsedExpense> {
  const provider = options.model === "claude" ? claudeProvider : geminiProvider;
  const prompt = buildExpensePrompt(options.message, options.currency);

  let raw: string;
  try {
    raw = await provider(prompt);
  } catch {
    throw new Error("PROVIDER_FAILED");
  }

  try {
    return parseExpense(raw);
  } catch {
    const retryPrompt =
      prompt +
      "\n\nIMPORTANT: Respond with ONLY the JSON object. No prose, no markdown.";
    const retryRaw = await provider(retryPrompt);
    return parseExpense(retryRaw);
  }
}
