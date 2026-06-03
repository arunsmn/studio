"use client";

import type { AppEntry } from "../data/apps";
import { AppCard } from "./AppCard";

type Category = "all" | "app" | "tool" | "game";

interface AppGridProps {
  apps: AppEntry[];
  filter: Category;
}

export function AppGrid({ apps, filter }: AppGridProps) {
  const filtered = filter === "all" ? apps : apps.filter((a) => a.category === filter);

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No {filter}s yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((app) => (
        <AppCard key={app.slug} app={app} />
      ))}
    </div>
  );
}
