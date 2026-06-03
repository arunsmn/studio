"use client";

import { useState } from "react";
import type { Colour } from "../lib/types";

interface BannerStripProps {
  colours: Colour[];
  selected: number | null;
  onSelect: (i: number) => void;
}

export function BannerStrip({ colours, selected, onSelect }: BannerStripProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className="flex w-full overflow-hidden rounded-xl"
      role="group"
      aria-label="Colour palette banner"
    >
      {colours.map((colour, i) => {
        const isSelected = selected === i;
        const isHovered = hoveredIndex === i;

        return (
          <button
            key={`${colour.hex}-${i}`}
            aria-label={`${colour.name}, ${colour.hex}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="h-11 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 md:h-14"
            style={{
              backgroundColor: colour.hex,
              flex: isSelected || isHovered ? 2 : 1,
              transition: "flex 0.2s ease",
              ...(isSelected
                ? {
                    outlineStyle: "solid",
                    outlineWidth: "2px",
                    outlineOffset: "-2px",
                    outlineColor: "#111827",
                  }
                : {}),
            }}
          />
        );
      })}
    </div>
  );
}
