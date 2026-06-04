import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@studio/ai-core", () => ({
  claudeProvider: vi.fn(),
  geminiProvider: vi.fn(),
}));

import { claudeProvider, geminiProvider } from "@studio/ai-core";
import { generatePalette } from "../lib/providers";
import type { PaletteOptions } from "../lib/types";

const BASE_OPTIONS: PaletteOptions = {
  mood: "ocean breeze",
  tone: "cool",
  useCase: "web-app",
  audience: "everyone",
  theme: "light",
  count: 5,
  model: "gemini",
};

const VALID_COLOUR = {
  hex: "#4A90D9",
  name: "Sky Blue",
  usage: "primary",
  rationale: "A calming primary tone.",
};

const VALID_RAW = JSON.stringify(Array.from({ length: 5 }, () => VALID_COLOUR));

describe("generatePalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("happy path", () => {
    it("calls geminiProvider when model is gemini and returns parsed colours", async () => {
      vi.mocked(geminiProvider).mockResolvedValue(VALID_RAW);
      const result = await generatePalette(BASE_OPTIONS);
      expect(vi.mocked(geminiProvider)).toHaveBeenCalledOnce();
      expect(vi.mocked(claudeProvider)).not.toHaveBeenCalled();
      expect(result).toHaveLength(5);
      expect(result[0].hex).toBe("#4A90D9");
    });

    it("calls claudeProvider when model is claude", async () => {
      const claudeRaw = JSON.stringify(Array.from({ length: 5 }, () => VALID_COLOUR));
      vi.mocked(claudeProvider).mockResolvedValue(claudeRaw);
      const result = await generatePalette({ ...BASE_OPTIONS, model: "claude" });
      expect(vi.mocked(claudeProvider)).toHaveBeenCalledOnce();
      expect(vi.mocked(geminiProvider)).not.toHaveBeenCalled();
      expect(result).toHaveLength(5);
    });

    it("passes the built prompt to the provider", async () => {
      vi.mocked(geminiProvider).mockResolvedValue(VALID_RAW);
      await generatePalette(BASE_OPTIONS);
      const [promptArg] = vi.mocked(geminiProvider).mock.calls[0];
      expect(typeof promptArg).toBe("string");
      expect(promptArg).toContain("ocean breeze");
    });
  });

  describe("retry behaviour", () => {
    it("retries once when the first response cannot be parsed", async () => {
      vi.mocked(geminiProvider)
        .mockResolvedValueOnce("not valid json at all")
        .mockResolvedValueOnce(VALID_RAW);
      const result = await generatePalette(BASE_OPTIONS);
      expect(vi.mocked(geminiProvider)).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(5);
    });

    it("appends a stricter suffix on the retry prompt", async () => {
      vi.mocked(geminiProvider)
        .mockResolvedValueOnce("not valid json at all")
        .mockResolvedValueOnce(VALID_RAW);
      await generatePalette(BASE_OPTIONS);
      const retryPrompt = vi.mocked(geminiProvider).mock.calls[1][0];
      expect(retryPrompt).toContain("Return ONLY the JSON array");
    });

    it("throws PARSE_FAILED if both the first and retry attempts fail", async () => {
      vi.mocked(geminiProvider).mockResolvedValue("still not valid");
      await expect(generatePalette(BASE_OPTIONS)).rejects.toThrow("PARSE_FAILED");
      expect(vi.mocked(geminiProvider)).toHaveBeenCalledTimes(2);
    });
  });

  describe("edge cases", () => {
    it("returns colours with the correct shape from provider response", async () => {
      vi.mocked(geminiProvider).mockResolvedValue(VALID_RAW);
      const result = await generatePalette(BASE_OPTIONS);
      for (const colour of result) {
        expect(colour).toHaveProperty("hex");
        expect(colour).toHaveProperty("name");
        expect(colour).toHaveProperty("usage");
        expect(colour).toHaveProperty("rationale");
      }
    });

    it("propagates provider errors that are not parse failures", async () => {
      vi.mocked(geminiProvider).mockRejectedValue(new Error("Network error"));
      await expect(generatePalette(BASE_OPTIONS)).rejects.toThrow("Network error");
    });
  });
});
