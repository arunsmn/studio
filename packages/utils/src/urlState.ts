// TextEncoder/TextDecoder handle the full Unicode range (smart quotes, em
// dashes, etc.) that btoa(JSON.stringify(...)) would throw on for chars > U+00FF.
export function encodeState<T>(obj: T): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Tries the new UTF-8 path first (fatal:true throws on invalid UTF-8 bytes),
// then falls back to the legacy btoa/atob path for URLs encoded before this fix.
export function decodeState<T>(str: string): T | null {
  try {
    const bytes = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as T;
  } catch {
    try {
      return JSON.parse(atob(str)) as T;
    } catch {
      return null;
    }
  }
}
