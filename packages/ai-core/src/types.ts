export type AIModel = "claude" | "gemini";

export type ProviderFn = (prompt: string) => Promise<string>;

export type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export type VisionProviderFn = (
  prompt: string,
  imageBase64: string,
  mimeType: ImageMimeType
) => Promise<string>;

export interface RateLimitResult {
  allowed: boolean;
  waitSeconds: number;
}
