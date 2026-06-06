export function parseInsight(raw: string): string {
  return raw.replace(/[*_`#]/g, "").trim();
}
