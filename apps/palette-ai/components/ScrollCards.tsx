"use client";

import { cn, getTextColour } from "@studio/utils";
import type { Colour } from "../lib/types";

interface ScrollCardsProps {
  colours: Colour[];
  selected: number | null;
  onSelect: (i: number) => void;
}

export function ScrollCards({ colours, selected, onSelect }: ScrollCardsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {colours.map((colour, i) => {
        const isSelected = selected === i;
        const textColour = getTextColour(colour.hex);

        return (
          <button
            key={`${colour.hex}-${i}`}
            onClick={() => onSelect(i)}
            aria-label={`${colour.name}, ${colour.hex}`}
            aria-pressed={isSelected}
            className={cn(
              "flex w-[110px] flex-none flex-col overflow-hidden rounded-xl border transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              isSelected
                ? "border-[1.5px] border-violet-500"
                : "border-gray-200 dark:border-gray-700"
            )}
            style={{ scrollSnapAlign: "start" }}
          >
            <div
              className="relative h-14 w-full"
              style={{ backgroundColor: colour.hex }}
            >
              <span
                className="absolute bottom-1 left-1.5 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: textColour }}
              >
                {colour.usage}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 bg-white px-2 py-1.5 text-left dark:bg-gray-900">
              <span className="truncate text-xs font-medium text-gray-900 dark:text-gray-50">
                {colour.name}
              </span>
              <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                {colour.hex}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
