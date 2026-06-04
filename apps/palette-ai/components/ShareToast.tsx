"use client";

import { Link } from "lucide-react";
import { cn } from "@studio/utils";

interface ShareToastProps {
  visible: boolean;
}

export function ShareToast({ visible }: ShareToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "flex items-center gap-2",
        "bg-gray-900 dark:bg-gray-100",
        "text-white dark:text-gray-900",
        "px-4 py-2 rounded-full text-sm font-medium shadow-lg",
        "transition-all duration-200",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      <Link className="w-4 h-4 flex-shrink-0" />
      Link copied!
    </div>
  );
}
