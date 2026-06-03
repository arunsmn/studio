export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

export function hexToHSL(hex: string): string {
  const [rRaw, gRaw, bRaw] = hexToRgb(hex);
  const r = rRaw / 255;
  const g = gRaw / 255;
  const b = bRaw / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function getContrastRatio(hex: string): number {
  const L = relativeLuminance(hex);
  const Lwhite = 1.0;
  const lighter = Math.max(L, Lwhite);
  const darker = Math.min(L, Lwhite);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getTextColour(hex: string): "#ffffff" | "#1a1a1a" {
  const bgL = relativeLuminance(hex);
  const darkL = relativeLuminance("#1a1a1a");
  const whiteL = 1.0;
  const contrastWithWhite = (Math.max(bgL, whiteL) + 0.05) / (Math.min(bgL, whiteL) + 0.05);
  const contrastWithDark = (Math.max(bgL, darkL) + 0.05) / (Math.min(bgL, darkL) + 0.05);
  return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#1a1a1a";
}

export function isWCAGAA(hex: string): boolean {
  return getContrastRatio(hex) >= 4.5;
}

export function isWCAGAAA(hex: string): boolean {
  return getContrastRatio(hex) >= 7;
}
