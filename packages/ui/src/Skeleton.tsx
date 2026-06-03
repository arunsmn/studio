"use client";

import { cn } from "@studio/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function Skeleton({ className, count = 1, height, width }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800", className)}
          style={{ height, width }}
        />
      ))}
    </>
  );
}
