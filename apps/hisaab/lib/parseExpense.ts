import { ALL_CATEGORIES } from "./categories";
import type { ParsedExpense, ParseExpenseResult, PartialExpense, Category } from "./types";

function toCategory(category: unknown): Category {
  return typeof category === "string" && ALL_CATEGORIES.includes(category as Category)
    ? (category as Category)
    : "Others";
}

function toDate(date: unknown): string {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return typeof date === "string" && datePattern.test(date)
    ? date
    : new Date().toISOString().split("T")[0];
}

function toParsedExpense(value: unknown): ParsedExpense {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as Record<string, unknown>).amount !== "number" ||
    typeof (value as Record<string, unknown>).category !== "string" ||
    typeof (value as Record<string, unknown>).description !== "string" ||
    typeof (value as Record<string, unknown>).date !== "string"
  ) {
    throw new Error("PARSE_FAILED");
  }

  const { amount, category, description, date } = value as {
    amount: number;
    category: string;
    description: string;
    date: string;
  };

  return { amount, category: toCategory(category), description, date: toDate(date) };
}

function toPartialExpense(value: unknown): PartialExpense {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as Record<string, unknown>).category !== "string" ||
    typeof (value as Record<string, unknown>).description !== "string" ||
    typeof (value as Record<string, unknown>).date !== "string"
  ) {
    throw new Error("PARSE_FAILED");
  }

  const { category, description, date } = value as {
    category: string;
    description: string;
    date: string;
  };

  return { category: toCategory(category), description, date: toDate(date) };
}

export function parseExpense(raw: string): ParseExpenseResult {
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

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("PARSE_FAILED");
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.multiple === true) {
    if (!Array.isArray(obj.expenses) || obj.expenses.length < 2) {
      throw new Error("PARSE_FAILED");
    }
    return { type: "multiple", expenses: obj.expenses.map(toParsedExpense) };
  }

  if (obj.needsAmount === true) {
    return { type: "needsAmount", partial: toPartialExpense(obj) };
  }

  return { type: "complete", expense: toParsedExpense(obj) };
}
