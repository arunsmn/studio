export function encodeState<T>(obj: T): string {
  return btoa(JSON.stringify(obj));
}

export function decodeState<T>(str: string): T | null {
  try {
    return JSON.parse(atob(str)) as T;
  } catch {
    return null;
  }
}
