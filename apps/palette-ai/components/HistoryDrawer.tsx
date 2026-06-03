"use client";

import { useEffect, useRef } from "react";
import { cn } from "@studio/utils";
import { Button } from "@studio/ui";
import { X, Clock, Trash2 } from "lucide-react";
import type { Palette } from "../lib/types";

interface HistoryDrawerProps {
  open: boolean;
  history: Palette[];
  onClose: () => void;
  onSelect: (palette: Palette) => void;
  onClear: () => void;
}

function MiniSwatch({ colours }: { colours: Palette["colours"] }) {
  return (
    <div className="flex h-8 overflow-hidden rounded-lg" aria-hidden>
      {colours.map((c, i) => (
        <div
          key={`${c.hex}-${i}`}
          className="flex-1 transition-colors duration-300"
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

function formatRelativeTime(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function HistoryDrawer({
  open,
  history,
  onClose,
  onSelect,
  onClear,
}: HistoryDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Palette history"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col",
          "bg-white shadow-2xl dark:bg-gray-900",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" aria-hidden />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              History
            </span>
            {history.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                aria-label="Clear all history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close history drawer"
              className={cn(
                "rounded-lg p-1.5 text-gray-400 transition-colors duration-150",
                "hover:bg-gray-100 hover:text-gray-600",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                "dark:hover:bg-gray-800 dark:hover:text-gray-300"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" aria-live="polite">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-center">
              <Clock className="h-8 w-8 text-gray-200 dark:text-gray-700" aria-hidden />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No history yet
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-600">
                Generated palettes will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => {
                    onSelect(palette);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full flex-col gap-2 rounded-xl border border-gray-200 p-3 text-left",
                    "transition-colors duration-150",
                    "hover:border-gray-300 hover:bg-gray-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    "dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
                  )}
                >
                  <MiniSwatch colours={palette.colours} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1 text-xs font-medium text-gray-800 dark:text-gray-200">
                      {palette.mood}
                    </span>
                    <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {formatRelativeTime(palette.createdAt)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                          palette.model === "claude"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        )}
                      >
                        {palette.model}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
