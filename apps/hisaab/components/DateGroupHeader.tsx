"use client";

interface DateGroupHeaderProps {
  label: string;
}

export default function DateGroupHeader({ label }: DateGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}
