import { ALL_CATEGORIES } from "./categories";

export function buildExpensePrompt(message: string, currency: string): string {
  const today = new Date().toISOString().split("T")[0];
  const categoryList = ALL_CATEGORIES.join(", ");

  return `You are a financial assistant that extracts expense data from natural language.

Today's date: ${today}
User's currency: ${currency}

Parse the following message and return a JSON object with exactly these fields:
- amount: number (positive, no currency symbol)
- category: one of [${categoryList}]
- description: string (short, 3–8 words, title-case)
- date: string (YYYY-MM-DD format; infer from message or use today's date)

Rules:
- If the user says "yesterday", subtract one day from today
- If the user says a day name ("Monday"), use the most recent past occurrence
- If category is unclear, use "Others"
- description should be concise and human-readable
- Return ONLY the JSON object with no explanation

User message: "${message}"`;
}
