import type { Colour } from "./types";

const VALID_USAGES: ReadonlyArray<Colour["usage"]> = [
  "background",
  "surface",
  "primary",
  "accent",
  "text",
  "card",
  "sidebar",
  "highlight",
  "success",
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface RawColour {
  hex: string;
  name: string;
  usage: string;
  rationale: string;
}

function isRawColour(item: unknown): item is RawColour {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.hex === "string" &&
    typeof obj.name === "string" &&
    typeof obj.usage === "string" &&
    typeof obj.rationale === "string"
  );
}

export function parseColours(raw: string, count: number): Colour[] {
  let text = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("PARSE_FAILED");
  }
  text = text.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("PARSE_FAILED");
  }

  if (!Array.isArray(parsed) || parsed.length !== count) {
    throw new Error("PARSE_FAILED");
  }

  const colours: Colour[] = [];
  for (const item of parsed) {
    if (!isRawColour(item) || !HEX_RE.test(item.hex) || !VALID_USAGES.includes(item.usage as Colour["usage"])) {
      throw new Error("PARSE_FAILED");
    }
    colours.push({
      hex: item.hex,
      name: item.name,
      usage: item.usage as Colour["usage"],
      rationale: item.rationale,
    });
  }

  return colours;
}
