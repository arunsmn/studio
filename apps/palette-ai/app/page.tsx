"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { AppShell, ErrorState, Button } from "@studio/ui";
import { Clock, Share2 } from "lucide-react";
import { encodeState, decodeState } from "@studio/utils";
import { MoodInput } from "../components/MoodInput";
import { SwatchGrid } from "../components/SwatchGrid";
import { SkeletonGrid } from "../components/SkeletonGrid";
import { LivePreview } from "../components/LivePreview";
import { ExportPanel } from "../components/ExportPanel";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { ShareToast } from "../components/ShareToast";
import { usePalette } from "../hooks/usePalette";
import { useHistory } from "../hooks/useHistory";
import type { Colour, Palette, PaletteOptions } from "../lib/types";

export default function Home() {
  const { palette: generatedPalette, isLoading, error, cooldown, generate } = usePalette();
  const { history, addToHistory, clearHistory } = useHistory();

  const [activePalette, setActivePalette] = useState<Colour[] | null>(null);
  const [lastCount, setLastCount] = useState(5);
  const [lastOptions, setLastOptions] = useState<PaletteOptions | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const pendingPaletteRef = useRef<Omit<Palette, "colours"> | null>(null);

  useEffect(() => {
    function restoreFromHash(): void {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const restored = decodeState<Palette>(hash);
      if (restored) {
        setActivePalette(restored.colours);
        setLastCount(restored.colours.length);
      }
    }

    restoreFromHash();
    window.addEventListener("hashchange", restoreFromHash);
    return () => window.removeEventListener("hashchange", restoreFromHash);
  }, []);

  useEffect(() => {
    if (generatedPalette && pendingPaletteRef.current) {
      const full: Palette = {
        ...pendingPaletteRef.current,
        colours: generatedPalette,
      };
      addToHistory(full);
      window.location.hash = encodeState(full);
      setActivePalette(generatedPalette);
      pendingPaletteRef.current = null;
    }
  }, [generatedPalette, addToHistory]);

  const handleGenerate = useCallback(
    async (options: PaletteOptions) => {
      setLastCount(options.count);
      setLastOptions(options);
      pendingPaletteRef.current = {
        id: nanoid(),
        mood: options.mood,
        model: options.model,
        createdAt: Date.now(),
      };
      await generate(options);
    },
    [generate]
  );

  function handleShare(): void {
    void navigator.clipboard.writeText(window.location.href);
    setShareVisible(true);
    setTimeout(() => setShareVisible(false), 2000);
  }

  function handleHistorySelect(palette: Palette) {
    setActivePalette(palette.colours);
    setLastCount(palette.colours.length);
    window.location.hash = encodeState(palette);
  }

  return (
    <AppShell
      title="PaletteAI"
      actions={
        <>
          <button
            onClick={handleShare}
            aria-label="Copy shareable link"
            className="flex items-center gap-1.5 text-sm text-gray-500
                       hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50
                       transition-colors focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open palette history"
          >
            <Clock className="h-4 w-4" />
            {history.length > 0 && (
              <span className="ml-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {history.length}
              </span>
            )}
          </Button>
        </>
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-6 md:flex md:gap-6">
        <div className="w-full md:w-[400px] md:flex-shrink-0">
          <MoodInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            cooldown={cooldown}
          />
        </div>

        <div className="mt-6 min-w-0 flex-1 md:mt-0">
          {isLoading && <SkeletonGrid count={lastCount} />}

          {!isLoading && error && (
            <ErrorState
              message={error}
              onRetry={lastOptions ? () => generate(lastOptions) : undefined}
            />
          )}

          {!isLoading && !error && activePalette && (
            <div className="flex flex-col gap-6">
              <SwatchGrid colours={activePalette} count={lastCount} />
              <LivePreview colours={activePalette} />
              <ExportPanel colours={activePalette} />
            </div>
          )}

          {!isLoading && !error && !activePalette && (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Describe a mood above to generate your palette
              </p>
            </div>
          )}
        </div>
      </div>

      <HistoryDrawer
        open={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
      />
      <ShareToast visible={shareVisible} />
    </AppShell>
  );
}
