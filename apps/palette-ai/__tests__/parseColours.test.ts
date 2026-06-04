import { describe, it, expect } from "vitest";
import { parseColours } from "../lib/parseColours";

const VALID_COLOUR = {
  hex: "#4A90D9",
  name: "Ocean Blue",
  usage: "primary",
  rationale: "A calm blue that anchors the composition.",
};

function makeArray(count: number, overrides?: Record<string, unknown>): object[] {
  return Array.from({ length: count }, () => ({ ...VALID_COLOUR, ...overrides }));
}

describe("parseColours", () => {
  describe("happy path", () => {
    it("parses a valid 5-colour JSON array", () => {
      const result = parseColours(JSON.stringify(makeArray(5)), 5);
      expect(result).toHaveLength(5);
      expect(result[0].hex).toBe("#4A90D9");
      expect(result[0].name).toBe("Ocean Blue");
      expect(result[0].usage).toBe("primary");
    });

    it("parses a 3-colour array", () => {
      const result = parseColours(JSON.stringify(makeArray(3)), 3);
      expect(result).toHaveLength(3);
    });

    it("accepts all valid usage values", () => {
      const usages = [
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
      for (const usage of usages) {
        const result = parseColours(JSON.stringify(makeArray(1, { usage })), 1);
        expect(result[0].usage).toBe(usage);
      }
    });
  });

  describe("markdown fence stripping", () => {
    it("strips ```json fences before parsing", () => {
      const raw = "```json\n" + JSON.stringify(makeArray(5)) + "\n```";
      const result = parseColours(raw, 5);
      expect(result).toHaveLength(5);
    });

    it("strips plain ``` fences", () => {
      const raw = "```\n" + JSON.stringify(makeArray(3)) + "\n```";
      const result = parseColours(raw, 3);
      expect(result).toHaveLength(3);
    });
  });

  describe("prose text surrounding JSON", () => {
    it("extracts the array when surrounded by text", () => {
      const json = JSON.stringify(makeArray(5));
      const raw = `Here is your palette:\n${json}\nEnjoy!`;
      const result = parseColours(raw, 5);
      expect(result).toHaveLength(5);
    });
  });

  describe("malformed input — count", () => {
    it("throws PARSE_FAILED when array length is less than expected count", () => {
      expect(() => parseColours(JSON.stringify(makeArray(3)), 5)).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED when array length exceeds expected count", () => {
      expect(() => parseColours(JSON.stringify(makeArray(8)), 5)).toThrow("PARSE_FAILED");
    });
  });

  describe("malformed input — hex", () => {
    it("throws PARSE_FAILED for hex without leading #", () => {
      expect(() => parseColours(JSON.stringify(makeArray(1, { hex: "4A90D9" })), 1)).toThrow(
        "PARSE_FAILED"
      );
    });

    it("throws PARSE_FAILED for 3-digit shorthand hex", () => {
      expect(() => parseColours(JSON.stringify(makeArray(1, { hex: "#FFF" })), 1)).toThrow(
        "PARSE_FAILED"
      );
    });

    it("throws PARSE_FAILED for hex with invalid characters", () => {
      expect(() =>
        parseColours(JSON.stringify(makeArray(1, { hex: "#GGGGGG" })), 1)
      ).toThrow("PARSE_FAILED");
    });
  });

  describe("malformed input — usage", () => {
    it("throws PARSE_FAILED for an unknown usage value", () => {
      expect(() =>
        parseColours(JSON.stringify(makeArray(1, { usage: "header" })), 1)
      ).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED for empty usage string", () => {
      expect(() =>
        parseColours(JSON.stringify(makeArray(1, { usage: "" })), 1)
      ).toThrow("PARSE_FAILED");
    });
  });

  describe("malformed input — structure", () => {
    it("throws PARSE_FAILED for missing required fields", () => {
      const colours = [{ hex: "#FFFFFF", name: "White" }];
      expect(() => parseColours(JSON.stringify(colours), 1)).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED for non-array JSON", () => {
      expect(() => parseColours('{"hex":"#FFF"}', 1)).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED for empty string", () => {
      expect(() => parseColours("", 5)).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED for malformed JSON", () => {
      expect(() => parseColours("[{broken json}", 1)).toThrow("PARSE_FAILED");
    });

    it("throws PARSE_FAILED when array contains null items", () => {
      expect(() => parseColours("[null]", 1)).toThrow("PARSE_FAILED");
    });
  });
});
