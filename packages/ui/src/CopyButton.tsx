"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@studio/utils";

interface CopyButtonProps {
  value: string;
  size?: "sm" | "md";
}

export function CopyButton({ value, size = "md" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        copied
          ? "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      )}
    >
      {copied ? (
        <>
          <Check className={iconSize} />
          Copied!
        </>
      ) : (
        <>
          <Copy className={iconSize} />
          Copy
        </>
      )}
    </button>
  );
}
