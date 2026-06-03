"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@studio/utils";
import type { AppEntry } from "../data/apps";

interface AppCardProps {
  app: AppEntry;
}

function getIcon(name: string): LucideIcon | null {
  const icon = (LucideIcons as Record<string, unknown>)[name];
  return typeof icon === "function" ? (icon as LucideIcon) : null;
}

export function AppCard({ app }: AppCardProps) {
  const Icon = getIcon(app.icon);
  const isLive = app.status === "live";

  const card = (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 transition-colors duration-150",
        "dark:border-gray-800 dark:bg-gray-900",
        isLive
          ? "hover:border-gray-400 dark:hover:border-gray-600"
          : "opacity-75"
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            app.color
          )}
        >
          {Icon && <Icon className="h-5 w-5 text-violet-700" />}
        </div>
        {!isLive && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Coming soon
          </span>
        )}
      </div>
      <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
        {app.name}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{app.tagline}</p>
      <span className="mt-3 inline-block text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {app.category}
      </span>
    </div>
  );

  if (isLive) {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
        aria-label={`Open ${app.name}`}
      >
        {card}
      </a>
    );
  }

  return card;
}
