"use client";

import { cn } from "@studio/utils";

interface PillChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function PillChip({ label, selected, onClick, disabled = false }: PillChipProps) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        selected
          ? "border border-violet-600 bg-violet-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {label}
    </button>
  );
}
