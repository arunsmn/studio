"use client";

import { cn } from "@studio/utils";
import { ALL_CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryFilterChipsProps {
  activeCategories: Set<Category>;
  onToggle: (category: Category) => void;
}

export default function CategoryFilterChips({
  activeCategories,
  onToggle,
}: CategoryFilterChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {ALL_CATEGORIES.map((category) => {
        const isActive = activeCategories.has(category);
        return (
          <button
            key={category}
            role="checkbox"
            aria-checked={isActive}
            onClick={() => onToggle(category)}
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              isActive
                ? "bg-violet-600 text-white border-violet-600"
                : "border-gray-200 text-gray-600 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500",
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
