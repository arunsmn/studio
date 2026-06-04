import {
  checkRateLimit,
  claudeVisionProvider,
  geminiVisionProvider,
} from "@studio/ai-core";
import type { VisionProviderFn, ImageMimeType } from "@studio/ai-core";
import { parseColours } from "../../../lib/parseColours";
import type { Colour } from "../../../lib/types";

const VALID_MIMETYPES: ImageMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  const { allowed, waitSeconds } = await checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      { error: "Rate limit exceeded", waitSeconds },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (typeof b.imageBase64 !== "string" || b.imageBase64.length === 0) {
    return Response.json(
      { error: "imageBase64: must be a non-empty string" },
      { status: 400 }
    );
  }
  if (b.imageBase64.length > 6_972_000) {
    return Response.json(
      { error: "Image too large. Maximum size is 5 MB." },
      { status: 400 }
    );
  }

  if (typeof b.mimeType !== "string" || !VALID_MIMETYPES.includes(b.mimeType as ImageMimeType)) {
    return Response.json(
      { error: "mimeType: must be image/jpeg, image/png, or image/webp" },
      { status: 400 }
    );
  }

  if (b.count !== 3 && b.count !== 5 && b.count !== 6 && b.count !== 8) {
    return Response.json(
      { error: "count: must be 3, 5, 6, or 8" },
      { status: 400 }
    );
  }

  if (b.model !== "claude" && b.model !== "gemini") {
    return Response.json(
      { error: "model: must be claude or gemini" },
      { status: 400 }
    );
  }

  const imageBase64 = b.imageBase64 as string;
  const mimeType = b.mimeType as ImageMimeType;
  const count = b.count as 3 | 5 | 6 | 8;
  const model = b.model as "claude" | "gemini";

  const visionProvider: VisionProviderFn =
    model === "claude" ? claudeVisionProvider : geminiVisionProvider;

  const prompt = `Extract exactly ${count} colours from this image.
Return ONLY a JSON array. Each item must have these fields:
- hex: a valid 6-digit hex colour e.g. "#a3b4c5"
- name: a short descriptive colour name
- usage: one of "background" | "surface" | "primary" | "accent" | "text" | "card" | "sidebar" | "highlight" | "success"
- rationale: one sentence explaining why this colour appears in the image

Respond with ONLY the JSON array. No markdown. No explanation. No fences.`;

  try {
    let raw: string;
    try {
      raw = await Promise.race<string>([
        visionProvider(prompt, imageBase64, mimeType),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("TIMEOUT")), 15000)
        ),
      ]);
    } catch (err) {
      if (err instanceof Error && err.message === "TIMEOUT") {
        return Response.json({ error: "Request timed out" }, { status: 504 });
      }
      throw err;
    }

    let colours: Colour[];
    try {
      colours = parseColours(raw, count);
    } catch {
      const retryRaw = await visionProvider(
        prompt +
          "\nIMPORTANT: Return ONLY the JSON array. No other text whatsoever.",
        imageBase64,
        mimeType
      );
      try {
        colours = parseColours(retryRaw, count);
      } catch {
        return Response.json(
          { error: "Model returned unparseable response" },
          { status: 502 }
        );
      }
    }

    return Response.json({ colours });
  } catch (err) {
    console.error(err instanceof Error ? err.constructor.name : "UnknownError");
    return Response.json({ error: "Provider error" }, { status: 503 });
  }
}
