export type AIModel = "claude" | "gemini";

export type ProviderFn = (prompt: string) => Promise<string>;

export interface RateLimitResult {
  allowed: boolean;
  waitSeconds: number;
}
