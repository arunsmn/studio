import type { PaletteOptions } from "./types";

const ALLOWED_USAGES = [
  "background",
  "surface",
  "primary",
  "accent",
  "text",
  "card",
  "sidebar",
  "highlight",
  "success",
] as const;

export function buildPrompt(options: PaletteOptions): string {
  const { mood, tone, useCase, audience, theme, count } = options;

  return `Generate exactly ${count} colours for a ${theme} ${useCase} colour palette.

Mood: "${mood}"
Tone: ${tone}
Use case: ${useCase}
Target audience: ${audience}
Theme: ${theme}

Return a JSON array of exactly ${count} objects. Each object must have these exact fields:
- "hex": a valid 6-digit hex colour starting with # (e.g. "#4A90D9")
- "name": a short creative name for the colour (2-4 words)
- "usage": one of these exact values: ${ALLOWED_USAGES.join(", ")}
- "rationale": one sentence explaining why this colour suits the mood and use case

Rules:
- Colours must work harmoniously together as a cohesive palette
- Hex values must be valid 6-digit hex codes
- The palette must clearly reflect the mood "${mood}"

Respond with ONLY the JSON array. Nothing else.`;
}
