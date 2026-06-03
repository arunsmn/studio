"use client";

import { useState } from "react";
import type { AppEntry } from "../data/apps";
import { FilterBar } from "./FilterBar";
import { AppGrid } from "./AppGrid";

type Category = "all" | "app" | "tool" | "game";

interface AppGalleryProps {
  apps: AppEntry[];
}

export function AppGallery({ apps }: AppGalleryProps) {
  const [filter, setFilter] = useState<Category>("all");

  return (
    <div>
      <FilterBar activeFilter={filter} onFilter={setFilter} />
      <AppGrid apps={apps} filter={filter} />
    </div>
  );
}
