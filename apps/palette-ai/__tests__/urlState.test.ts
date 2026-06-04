import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "@studio/utils";

interface Palette {
  mood: string;
  colours: { hex: string; name: string }[];
}

describe("encodeState / decodeState", () => {
  describe("happy path", () => {
    it("round-trips a simple object", () => {
      const original = { foo: "hello", bar: 42 };
      expect(decodeState(encodeState(original))).toEqual(original);
    });

    it("round-trips a complex nested object", () => {
      const original: Palette = {
        mood: "fiery sunset",
        colours: [
          { hex: "#ff4500", name: "Lava" },
          { hex: "#ff6600", name: "Ember" },
        ],
      };
      expect(decodeState<Palette>(encodeState(original))).toEqual(original);
    });

    it("round-trips an empty object", () => {
      expect(decodeState(encodeState({}))).toEqual({});
    });

    it("round-trips an array", () => {
      const arr = [1, "two", true];
      expect(decodeState(encodeState(arr))).toEqual(arr);
    });

    it("produces a pure base64 string (no illegal chars)", () => {
      const encoded = encodeState({ a: 1 });
      expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe("malformed input", () => {
    it("returns null for a string with invalid base64 characters", () => {
      expect(decodeState("not valid base64 !!!")).toBeNull();
    });

    it("returns null for valid base64 that decodes to non-JSON", () => {
      const nonJson = btoa("this is not json");
      expect(decodeState(nonJson)).toBeNull();
    });

    it("returns null for an empty string", () => {
      expect(decodeState("")).toBeNull();
    });
  });

  describe("boundary / edge cases", () => {
    it("preserves Latin-1 accented characters through the round-trip", () => {
      const original = { label: "café résumé" };
      expect(decodeState(encodeState(original))).toEqual(original);
    });

    it("preserves null values in objects", () => {
      const original = { a: null, b: "ok" };
      expect(decodeState(encodeState(original))).toEqual(original);
    });
  });
});
