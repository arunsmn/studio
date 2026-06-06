import { ALL_CATEGORIES } from "./categories";
import type { ParsedExpense, Category } from "./types";

export function parseExpense(raw: string): ParsedExpense {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("PARSE_FAILED");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).amount !== "number" ||
    typeof (parsed as Record<string, unknown>).category !== "string" ||
    typeof (parsed as Record<string, unknown>).description !== "string" ||
    typeof (parsed as Record<string, unknown>).date !== "string"
  ) {
    throw new Error("PARSE_FAILED");
  }

  const { amount, category, description, date } = parsed as {
    amount: number;
    category: string;
    description: string;
    date: string;
  };

  const validCategory: Category = ALL_CATEGORIES.includes(category as Category)
    ? (category as Category)
    : "Others";

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const validDate = datePattern.test(date)
    ? date
    : new Date().toISOString().split("T")[0];

  return { amount, category: validCategory, description, date: validDate };
}
