"use client";

import { cn, hexToHSL, getContrastRatio, isWCAGAA, isWCAGAAA } from "@studio/utils";
import { CopyButton } from "@studio/ui";
import type { Colour } from "../lib/types";

interface DetailPanelProps {
  colour: Colour | null;
}

export function DetailPanel({ colour }: DetailPanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        colour ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}
      aria-live="polite"
    >
      {colour && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 flex-shrink-0 rounded-lg"
              style={{ backgroundColor: colour.hex }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {colour.name}
                </span>
                <BadgePair
                  passes={isWCAGAA(colour.hex)}
                  label="AA"
                />
                <BadgePair
                  passes={isWCAGAAA(colour.hex)}
                  label="AAA"
                />
              </div>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                {colour.rationale}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                <DataRow label="hex" value={colour.hex} mono />
                <DataRow label="hsl" value={`hsl(${hexToHSL(colour.hex)})`} mono />
                <DataRow
                  label="contrast"
                  value={`${getContrastRatio(colour.hex).toFixed(2)}:1`}
                  mono
                />
                <DataRow label="usage" value={colour.usage} />
              </div>
              <div className="mt-3">
                <CopyButton value={colour.hex} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span
        className={cn(
          "text-xs text-gray-700 dark:text-gray-300",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function BadgePair({ passes, label }: { passes: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        passes
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {label} {passes ? "✓" : "✗"}
    </span>
  );
}
