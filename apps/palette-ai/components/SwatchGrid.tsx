"use client";

import { useState, useEffect } from "react";
import { BannerStrip } from "./BannerStrip";
import { SwatchCard } from "./SwatchCard";
import { LabelList } from "./LabelList";
import { ScrollCards } from "./ScrollCards";
import { DetailPanel } from "./DetailPanel";
import type { Colour } from "../lib/types";

interface SwatchGridProps {
  colours: Colour[];
  count: number;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function SwatchGrid({ colours, count }: SwatchGridProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const isMobile = useIsMobile();

  function handleSelect(i: number) {
    setSelected((prev) => (prev === i ? null : i));
  }

  const selectedColour = selected !== null ? (colours[selected] ?? null) : null;

  return (
    <div className="flex flex-col gap-3">
      {isMobile ? (
        <>
          <BannerStrip
            colours={colours}
            selected={selected}
            onSelect={handleSelect}
          />
          {count <= 5 ? (
            <LabelList
              colours={colours}
              selected={selected}
              onSelect={handleSelect}
            />
          ) : (
            <ScrollCards
              colours={colours}
              selected={selected}
              onSelect={handleSelect}
            />
          )}
        </>
      ) : (
        <div className="flex gap-3">
          {colours.map((colour, i) => (
            <SwatchCard
              key={`${colour.hex}-${i}`}
              colour={colour}
              selected={selected === i}
              onClick={() => handleSelect(i)}
            />
          ))}
        </div>
      )}
      <DetailPanel colour={selectedColour} />
    </div>
  );
}
