import { NextRequest } from "next/server";
import { geminiProvider, claudeProvider } from "@studio/ai-core";
import { buildInsightPrompt } from "@/lib/buildInsightPrompt";
import { parseInsight } from "@/lib/parseInsight";
import type { Expense } from "@/lib/types";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>).expenses) ||
    !["weekly", "monthly"].includes(
      (body as Record<string, unknown>).period as string,
    ) ||
    typeof (body as Record<string, unknown>).currency !== "string"
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { expenses: rawExpenses, period, currency } = body as {
    expenses: Expense[];
    period: "weekly" | "monthly";
    currency: string;
  };

  if (currency.length < 2 || currency.length > 5) {
    return Response.json(
      { error: "currency: must be 2–5 characters" },
      { status: 400 },
    );
  }

  const expenses = rawExpenses.slice(0, 200);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const prompt = buildInsightPrompt(expenses, period, currency);
    let raw: string;
    try {
      raw = await geminiProvider(prompt);
    } catch {
      raw = await claudeProvider(prompt);
    }
    const insight = parseInsight(raw);
    return Response.json({ insight });
  } catch {
    return Response.json({ error: "Insight unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
