"use client";

import { cn, isWCAGAA } from "@studio/utils";
import { CopyButton } from "@studio/ui";
import type { Colour } from "../lib/types";

interface LabelListProps {
  colours: Colour[];
  selected: number | null;
  onSelect: (i: number) => void;
}

export function LabelList({ colours, selected, onSelect }: LabelListProps) {
  return (
    <div className="flex flex-col gap-2">
      {colours.map((colour, i) => {
        const isSelected = selected === i;
        const passes = isWCAGAA(colour.hex);

        return (
          <button
            key={`${colour.hex}-${i}`}
            onClick={() => onSelect(i)}
            aria-label={`${colour.name}, ${colour.hex}`}
            aria-pressed={isSelected}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              isSelected
                ? "border-l-2 border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            )}
          >
            <span
              className="h-6 w-6 flex-shrink-0 rounded-md"
              style={{ backgroundColor: colour.hex }}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                  {colour.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    passes
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {passes ? "AA ✓" : "AA ✗"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {colour.hex}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {colour.usage}
                </span>
              </div>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              <CopyButton value={colour.hex} size="sm" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
