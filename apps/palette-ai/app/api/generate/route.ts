import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@studio/ai-core";
import { generatePalette } from "../../../lib/providers";
import type { PaletteOptions } from "../../../lib/types";

const VALID_TONES: ReadonlyArray<PaletteOptions["tone"]> = [
  "warm",
  "cool",
  "bold",
  "muted",
  "vibrant",
];
const VALID_USE_CASES: ReadonlyArray<PaletteOptions["useCase"]> = [
  "web-app",
  "brand",
  "presentation",
  "social",
  "print",
];
const VALID_AUDIENCES: ReadonlyArray<PaletteOptions["audience"]> = [
  "kids",
  "professionals",
  "gen-z",
  "luxury",
  "healthcare",
  "everyone",
];
const VALID_THEMES: ReadonlyArray<PaletteOptions["theme"]> = [
  "light",
  "dark",
  "both",
];
const VALID_COUNTS: ReadonlyArray<PaletteOptions["count"]> = [3, 5, 6, 8];

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let rateLimit = { allowed: true, waitSeconds: 0 };
  try {
    rateLimit = await checkRateLimit(ip);
  } catch {
    // KV not configured (local dev) — allow request
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait before generating again.",
        waitSeconds: rateLimit.waitSeconds,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "mood: invalid request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "mood: invalid request body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const rawMood = typeof b.mood === "string" ? stripHtml(b.mood).trim() : "";
  if (rawMood.length < 2 || rawMood.length > 200) {
    return NextResponse.json(
      { error: "mood: must be between 2 and 200 characters" },
      { status: 400 }
    );
  }

  if (!VALID_TONES.includes(b.tone as PaletteOptions["tone"])) {
    return NextResponse.json(
      { error: `tone: must be one of ${VALID_TONES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_USE_CASES.includes(b.useCase as PaletteOptions["useCase"])) {
    return NextResponse.json(
      { error: `useCase: must be one of ${VALID_USE_CASES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_AUDIENCES.includes(b.audience as PaletteOptions["audience"])) {
    return NextResponse.json(
      { error: `audience: must be one of ${VALID_AUDIENCES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_THEMES.includes(b.theme as PaletteOptions["theme"])) {
    return NextResponse.json(
      { error: `theme: must be one of ${VALID_THEMES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_COUNTS.includes(b.count as PaletteOptions["count"])) {
    return NextResponse.json(
      { error: `count: must be one of ${VALID_COUNTS.join(", ")}` },
      { status: 400 }
    );
  }

  if (b.model !== "claude" && b.model !== "gemini") {
    return NextResponse.json(
      { error: "model: must be claude or gemini" },
      { status: 400 }
    );
  }

  const options: PaletteOptions = {
    mood: rawMood,
    tone: b.tone as PaletteOptions["tone"],
    useCase: b.useCase as PaletteOptions["useCase"],
    audience: b.audience as PaletteOptions["audience"],
    theme: b.theme as PaletteOptions["theme"],
    count: b.count as PaletteOptions["count"],
    model: b.model,
  };

  const abortCtrl = new AbortController();
  const timeoutId = setTimeout(() => abortCtrl.abort(), 15_000);

  try {
    const colours = await Promise.race([
      generatePalette(options),
      new Promise<never>((_, reject) => {
        abortCtrl.signal.addEventListener("abort", () =>
          reject(Object.assign(new Error("Timed out"), { name: "AbortError" }))
        );
      }),
    ]);
    return NextResponse.json({ palette: colours, model: options.model });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : "";
    if (name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    if (message === "PARSE_FAILED") {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate palette" },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
