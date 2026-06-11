import { ALL_CATEGORIES } from "./categories";

export function buildExpensePrompt(message: string, currency: string): string {
  const today = new Date().toISOString().split("T")[0];
  const categoryList = ALL_CATEGORIES.join(", ");

  return `You are a financial assistant that extracts expense data from natural language.

Today's date: ${today}
User's currency: ${currency}

Parse the following message and return ONE of these three JSON shapes:

1. A single complete expense:
{"amount": number, "category": string, "description": string, "date": string}

2. If the message does NOT specify any amount — do not guess or default to a
   placeholder value. Instead return a partial expense:
{"needsAmount": true, "category": string, "description": string, "date": string}

3. If the message describes more than one separate expense (e.g. different
   items, amounts, or categories) — do NOT merge them into one. Instead
   return all of them:
{"multiple": true, "expenses": [{"amount": number, "category": string, "description": string, "date": string}, ...]}

Field rules (apply to every expense object above):
- amount: number (positive, no currency symbol)
- category: one of [${categoryList}]
- description: string (short, 3–8 words, title-case)
- date: string (YYYY-MM-DD format; infer from message or use today's date)
- If the user says "yesterday", subtract one day from today
- If the user says a day name ("Monday"), use the most recent past occurrence
- If category is unclear, use "Others"
- description should be concise and human-readable

Return ONLY the JSON object with no explanation.

User message: "${message}"`;
}
