import type { Expense } from "./types";

export function buildInsightPrompt(
  expenses: Expense[],
  period: "weekly" | "monthly",
  currency: string,
): string {
  const periodLabel = period === "weekly" ? "this week" : "this month";
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  const breakdown = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `${cat}: ${amt} ${currency}`)
    .join(", ");

  return `You are a friendly personal finance assistant.

Spending summary for ${periodLabel}:
Total: ${total} ${currency}
By category: ${breakdown}
Number of transactions: ${expenses.length}

Write exactly ONE sentence (max 20 words) that gives a useful, specific insight
about this spending. Be specific (mention actual category names and amounts).
Do not use filler phrases like "It looks like" or "Based on your data".
Start directly with the insight.

Return ONLY the sentence. No JSON, no markdown.`;
}
