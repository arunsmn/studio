"use client";

import { cn } from "@studio/utils";
import type { AIModel } from "@studio/ai-core";

const STORAGE_KEY = "studio:preferred-model";

interface ModelToggleProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
}

interface ModelButtonProps {
  active: boolean;
  dotClass: string;
  label: string;
  onClick: () => void;
}

function ModelButton({ active, dotClass, label, onClick }: ModelButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        active
          ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-50"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      {label}
    </button>
  );
}

export function ModelToggle({ value, onChange }: ModelToggleProps) {
  function handleChange(model: AIModel) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, model);
    }
    onChange(model);
  }

  return (
    <div
      className="flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900"
      role="group"
      aria-label="AI model selection"
    >
      <ModelButton
        active={value === "gemini"}
        dotClass="bg-emerald-500"
        label="Gemini"
        onClick={() => handleChange("gemini")}
      />
      <ModelButton
        active={value === "claude"}
        dotClass="bg-violet-500"
        label="Claude"
        onClick={() => handleChange("claude")}
      />
    </div>
  );
}
