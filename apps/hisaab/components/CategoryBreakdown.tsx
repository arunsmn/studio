"use client";

import { CATEGORY_META } from "@/lib/categories";
import type { Currency, Category, ChartEntry } from "@/lib/types";

interface CategoryBreakdownProps {
  data: ChartEntry[];
  total: number;
  currency: Currency;
}

export default function CategoryBreakdown({
  data,
  total,
  currency,
}: CategoryBreakdownProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div role="list" className="flex flex-col gap-4">
      {sorted.map((entry) => {
        const meta = CATEGORY_META[entry.name as Category];
        const Icon = meta.Icon;
        const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;

        return (
          <div key={entry.name} role="listitem" className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 shrink-0 ${meta.colour}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {entry.name}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50 tabular-nums">
                {currency.symbol}{entry.value.toFixed(0)}
              </span>
              <span className="text-xs text-gray-400 w-9 text-right tabular-nums">
                {pct}%
              </span>
            </div>
            <div className="pl-6">
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${entry.name} ${pct}%`}
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: meta.chartColour }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
