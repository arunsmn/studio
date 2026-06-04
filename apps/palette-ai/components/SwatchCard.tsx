"use client";

import { cn, getTextColour } from "@studio/utils";
import { CopyButton } from "@studio/ui";
import type { Colour } from "../lib/types";

interface SwatchCardProps {
  colour: Colour;
  selected: boolean;
  onClick: () => void;
}

export function SwatchCard({ colour, selected, onClick }: SwatchCardProps) {
  const textColour = getTextColour(colour.hex);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${colour.name}, ${colour.hex}`}
      aria-pressed={selected}
      className={cn(
        "flex min-w-[100px] flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        selected
          ? "border-[1.5px] border-violet-500"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div
        className="relative h-20 w-full"
        style={{ backgroundColor: colour.hex }}
      >
        <span
          className="absolute bottom-1.5 left-2 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: textColour }}
        >
          {colour.usage}
        </span>
      </div>
      <div className="flex flex-col gap-1 bg-white p-2 text-left dark:bg-gray-900">
        <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
          {colour.name}
        </span>
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {colour.hex}
        </span>
        <div
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <CopyButton value={colour.hex} size="sm" />
        </div>
      </div>
    </div>
  );
}
