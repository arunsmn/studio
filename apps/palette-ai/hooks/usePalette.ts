"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Colour, PaletteOptions } from "../lib/types";

interface UsePaletteReturn {
  palette: Colour[] | null;
  isLoading: boolean;
  error: string | null;
  cooldown: number;
  generate: (options: PaletteOptions) => Promise<void>;
}

export function usePalette(): UsePaletteReturn {
  const [palette, setPalette] = useState<Colour[] | null>(null);
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

  return { palette, isLoading, error, cooldown, generate };
}
