"use client";

import { Skeleton } from "@studio/ui";

interface InsightCardProps {
  insight: string | null;
  loading: boolean;
  hasExpenses: boolean;
}

export default function InsightCard({
  insight,
  loading,
  hasExpenses,
}: InsightCardProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-start gap-2 px-4 py-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30"
    >
      <span className="text-base shrink-0">💡</span>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="flex flex-col gap-1.5">
            <Skeleton height="14px" className="w-full" />
            <Skeleton height="14px" className="w-3/4" />
          </div>
        ) : !hasExpenses ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add some expenses to see your spending insight.
          </p>
        ) : insight ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Insight unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
