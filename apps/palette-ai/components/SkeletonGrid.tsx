"use client";

import { Skeleton } from "@studio/ui";

interface SkeletonGridProps {
  count: number;
}

export function SkeletonGrid({ count }: SkeletonGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton height="44px" className="w-full rounded-xl md:h-14" />
      <div className="hidden gap-3 md:flex">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex min-w-[100px] flex-1 flex-col gap-2">
            <Skeleton height="80px" className="rounded-xl" />
            <Skeleton height="16px" width="70%" />
            <Skeleton height="12px" width="50%" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} height="52px" className="w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
