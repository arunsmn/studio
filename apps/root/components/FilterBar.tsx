"use client";

import { cn } from "@studio/utils";

type Category = "all" | "app" | "tool" | "game";

interface FilterBarProps {
  activeFilter: Category;
  onFilter: (category: Category) => void;
}

const FILTERS: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Apps", value: "app" },
  { label: "Tools", value: "tool" },
  { label: "Games", value: "game" },
];

export function FilterBar({ activeFilter, onFilter }: FilterBarProps) {
  return (
    <div className="mb-8 flex gap-2" role="tablist">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          role="tab"
          aria-selected={activeFilter === value}
          onClick={() => onFilter(value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
            activeFilter === value
              ? "bg-violet-600 text-white"
              : "border border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
