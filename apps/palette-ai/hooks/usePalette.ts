"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AIModel, ImageMimeType } from "@studio/ai-core";
import type { Colour, Palette, PaletteOptions } from "../lib/types";

interface UsePaletteReturn {
  palette: Colour[] | null;
  imagePalette: Palette | null;
  isLoading: boolean;
  error: string | null;
  cooldown: number;
  generate: (options: PaletteOptions) => Promise<void>;
  generateFromImage: (
    file: File,
    count: 3 | 5 | 6 | 8,
    model: AIModel
  ) => Promise<void>;
}

export function usePalette(): UsePaletteReturn {
  const [palette, setPalette] = useState<Colour[] | null>(null);
  const [imagePalette, setImagePalette] = useState<Palette | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCooldown(10);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const generate = useCallback(async (options: PaletteOptions) => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
        signal: controller.signal,
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? "Generation failed");
      }

      const successData = data as { palette: Colour[] };
      setPalette(successData.palette);
      startCooldown();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  }, []);

  async function generateFromImage(
    file: File,
    count: 3 | 5 | 6 | 8,
    model: AIModel
  ): Promise<void> {
    if (cooldown > 0) return;
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise<void>((resolve, reject) => {
      reader.onload = () => resolve();
      reader.onerror = () => reject(reader.error);
    });

    const dataUrl = reader.result as string;
    const [meta, imageBase64] = dataUrl.split(",");
    const mimeType = meta.split(":")[1].split(";")[0] as ImageMimeType;

    try {
      const res = await fetch("/api/generate-from-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType, count, model }),
      });

      if (res.status === 429) {
        const data = (await res.json()) as { error: string; waitSeconds: number };
        setError(data.error);
        startCooldown();
        return;
      }

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const data = (await res.json()) as { colours: Colour[] };
      setImagePalette({
        id: crypto.randomUUID(),
        mood: "from image",
        colours: data.colours,
        model,
        createdAt: Date.now(),
      });
      startCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    palette,
    imagePalette,
    isLoading,
    error,
    cooldown,
    generate,
    generateFromImage,
  };
}
