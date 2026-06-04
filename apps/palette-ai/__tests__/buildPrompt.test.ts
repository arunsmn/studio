import { describe, it, expect } from "vitest";
import { buildPrompt } from "../lib/buildPrompt";
import type { PaletteOptions } from "../lib/types";

const BASE_OPTIONS: PaletteOptions = {
  mood: "summer festival",
  tone: "warm",
  useCase: "web-app",
  audience: "everyone",
  theme: "light",
  count: 5,
  model: "gemini",
};

describe("buildPrompt", () => {
  describe("happy path", () => {
    it("includes the mood wrapped in quotes", () => {
      const prompt = buildPrompt(BASE_OPTIONS);
      expect(prompt).toContain('"summer festival"');
    });

    it("includes all PaletteOptions fields", () => {
      const prompt = buildPrompt(BASE_OPTIONS);
      expect(prompt).toContain("warm");
      expect(prompt).toContain("web-app");
      expect(prompt).toContain("everyone");
      expect(prompt).toContain("light");
    });

    it("instructs the model to return only JSON", () => {
      const prompt = buildPrompt(BASE_OPTIONS);
      expect(prompt).toContain("Respond with ONLY the JSON array");
    });

    it("lists all allowed usage values in the prompt", () => {
      const prompt = buildPrompt(BASE_OPTIONS);
      expect(prompt).toContain("background");
      expect(prompt).toContain("surface");
      expect(prompt).toContain("primary");
      expect(prompt).toContain("accent");
      expect(prompt).toContain("text");
      expect(prompt).toContain("card");
      expect(prompt).toContain("sidebar");
      expect(prompt).toContain("highlight");
      expect(prompt).toContain("success");
    });
  });

  describe("count boundary", () => {
    it("embeds the exact count = 5 in the output", () => {
      const prompt = buildPrompt({ ...BASE_OPTIONS, count: 5 });
      expect(prompt).toContain("exactly 5");
    });

    it("embeds the exact count = 8 in the output", () => {
      const prompt = buildPrompt({ ...BASE_OPTIONS, count: 8 });
      expect(prompt).toContain("exactly 8");
    });

    it("embeds the exact count = 3 in the output", () => {
      const prompt = buildPrompt({ ...BASE_OPTIONS, count: 3 });
      expect(prompt).toContain("exactly 3");
    });
  });

  describe("edge cases", () => {
    it("includes mood with special characters without breaking the prompt", () => {
      const prompt = buildPrompt({ ...BASE_OPTIONS, mood: 'a "quoted" mood & more' });
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("returns a string for all valid tone values", () => {
      const tones: PaletteOptions["tone"][] = ["warm", "cool", "bold", "muted", "vibrant"];
      for (const tone of tones) {
        const prompt = buildPrompt({ ...BASE_OPTIONS, tone });
        expect(typeof prompt).toBe("string");
        expect(prompt).toContain(tone);
      }
    });

    it("includes theme in a dark prompt", () => {
      const prompt = buildPrompt({ ...BASE_OPTIONS, theme: "dark" });
      expect(prompt).toContain("dark");
    });
  });
});
