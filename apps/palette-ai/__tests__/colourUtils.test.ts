import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  hexToHSL,
  getContrastRatio,
  getTextColour,
  isWCAGAA,
  isWCAGAAA,
} from "@studio/utils";

describe("hexToRgb", () => {
  it("converts pure white to [255, 255, 255]", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
  });

  it("converts pure black to [0, 0, 0]", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });

  it("converts an arbitrary hex value correctly", () => {
    expect(hexToRgb("#4A90D9")).toEqual([74, 144, 217]);
  });

  it("handles uppercase hex digits", () => {
    expect(hexToRgb("#FF0000")).toEqual([255, 0, 0]);
  });

  it("handles lowercase hex digits", () => {
    expect(hexToRgb("#00ff00")).toEqual([0, 255, 0]);
  });
});

describe("hexToHSL", () => {
  it("returns a string in 'H S% L%' format", () => {
    const result = hexToHSL("#4A90D9");
    expect(result).toMatch(/^\d+ \d+% \d+%$/);
  });

  it("maps pure white to '0 0% 100%'", () => {
    expect(hexToHSL("#ffffff")).toBe("0 0% 100%");
  });

  it("maps pure black to '0 0% 0%'", () => {
    expect(hexToHSL("#000000")).toBe("0 0% 0%");
  });

  it("maps pure red to a hue near 0°", () => {
    const result = hexToHSL("#ff0000");
    expect(result).toMatch(/^0 100% 50%$/);
  });
});

describe("getContrastRatio", () => {
  it("returns ~21 for pure black against white background", () => {
    expect(getContrastRatio("#000000")).toBeCloseTo(21, 0);
  });

  it("returns 1 for pure white against white background", () => {
    expect(getContrastRatio("#ffffff")).toBeCloseTo(1, 1);
  });

  it("returns a value between 1 and 21 for mid-grey", () => {
    const ratio = getContrastRatio("#888888");
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });
});

describe("getTextColour", () => {
  it("returns white text on a very dark background", () => {
    expect(getTextColour("#000000")).toBe("#ffffff");
  });

  it("returns dark text on a pure white background", () => {
    expect(getTextColour("#ffffff")).toBe("#1a1a1a");
  });

  it("returns white text on a dark navy background", () => {
    expect(getTextColour("#1a2e4a")).toBe("#ffffff");
  });

  it("returns dark text on a light yellow background", () => {
    expect(getTextColour("#fffde7")).toBe("#1a1a1a");
  });
});

describe("isWCAGAA", () => {
  it("passes for pure black (ratio ~21, threshold 4.5)", () => {
    expect(isWCAGAA("#000000")).toBe(true);
  });

  it("fails for pure white (ratio 1)", () => {
    expect(isWCAGAA("#ffffff")).toBe(false);
  });

  it("fails for mid-grey #888888 (ratio ~3.5)", () => {
    expect(isWCAGAA("#888888")).toBe(false);
  });
});

describe("isWCAGAAA", () => {
  it("passes for pure black (ratio ~21, threshold 7)", () => {
    expect(isWCAGAAA("#000000")).toBe(true);
  });

  it("fails for pure white (ratio 1)", () => {
    expect(isWCAGAAA("#ffffff")).toBe(false);
  });

  it("fails for mid-grey #888888 (ratio ~3.5)", () => {
    expect(isWCAGAAA("#888888")).toBe(false);
  });

  it("fails for a colour that passes AA but not AAA", () => {
    // #737373 has contrast ~4.73 against white: passes AA (≥4.5), fails AAA (≥7)
    expect(isWCAGAA("#737373")).toBe(true);
    expect(isWCAGAAA("#737373")).toBe(false);
  });
});
