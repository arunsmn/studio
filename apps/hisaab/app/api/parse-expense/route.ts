import { NextRequest } from "next/server";
import { checkRateLimit } from "@studio/ai-core";
import { generateParsedExpense } from "@/lib/providers";

export async function POST(req: NextRequest): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const limit = await checkRateLimit(ip);
  if (!limit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded", waitSeconds: limit.waitSeconds },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).message !== "string" ||
    typeof (body as Record<string, unknown>).currency !== "string" ||
    !["gemini", "claude"].includes(
      (body as Record<string, unknown>).model as string,
    )
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { message, currency, model } = body as {
    message: string;
    currency: string;
    model: "gemini" | "claude";
  };

  if (message.length < 2 || message.length > 500) {
    return Response.json(
      { error: "message: must be 2–500 characters" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const result = await generateParsedExpense({ message, currency, model });
    if (result.type === "complete" && result.expense.amount <= 0) {
      return Response.json(
        { error: "amount: must be a positive number" },
        { status: 400 },
      );
    }
    if (result.type === "multiple") {
      const validExpenses = result.expenses.filter((e) => e.amount > 0);
      if (validExpenses.length < 2) {
        return Response.json(
          { error: "amount: must be a positive number" },
          { status: 400 },
        );
      }
      return Response.json({ type: "multiple", expenses: validExpenses });
    }
    return Response.json(result);
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    if (code === "PARSE_FAILED") {
      return Response.json(
        { error: "AI response could not be parsed" },
        { status: 502 },
      );
    }
    return Response.json({ error: "AI service unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
