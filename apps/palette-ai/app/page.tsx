"use client";

import { useState, useCallback } from "react";
import { AppShell, ErrorState } from "@studio/ui";
import { MoodInput } from "../components/MoodInput";
import { SwatchGrid } from "../components/SwatchGrid";
import { SkeletonGrid } from "../components/SkeletonGrid";
import { usePalette } from "../hooks/usePalette";
import type { PaletteOptions } from "../lib/types";

export default function Home() {
  const { palette, isLoading, error, cooldown, generate } = usePalette();
  const [lastCount, setLastCount] = useState(5);
  const [lastOptions, setLastOptions] = useState<PaletteOptions | null>(null);

  const handleGenerate = useCallback(
    async (options: PaletteOptions) => {
      setLastCount(options.count);
      setLastOptions(options);
      await generate(options);
    },
    [generate]
  );

  return (
    <AppShell title="PaletteAI">
      <div className="mx-auto max-w-6xl px-4 py-6 md:flex md:gap-6">
        <div className="w-full md:w-[400px] md:flex-shrink-0">
          <MoodInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            cooldown={cooldown}
          />
        </div>
        <div className="mt-6 flex-1 min-w-0 md:mt-0">
          {isLoading && <SkeletonGrid count={lastCount} />}
          {!isLoading && error && (
            <ErrorState
              message={error}
              onRetry={lastOptions ? () => generate(lastOptions) : undefined}
            />
          )}
          {!isLoading && !error && palette && (
            <SwatchGrid colours={palette} count={lastCount} />
          )}
          {!isLoading && !error && !palette && (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Describe a mood above to generate your palette
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
