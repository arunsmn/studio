"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@studio/utils";
import DonutChart from "./DonutChart";
import CategoryBreakdown from "./CategoryBreakdown";
import InsightCard from "./InsightCard";
import type { Currency, Expense, Category, ChartEntry } from "@/lib/types";

type Period = "weekly" | "monthly";

interface SummaryTabProps {
  currency: Currency | null;
  expenses: Expense[];
}

function getDateRange(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (period === "weekly" ? 6 : 29));
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function SummaryTab({ currency, expenses }: SummaryTabProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredExpenses = useMemo(() => {
    const { from, to } = getDateRange(period);
    return expenses.filter((e) => e.date >= from && e.date <= to);
  }, [expenses, period]);

  const { chartData, total } = useMemo(() => {
    const byCategory = new Map<Category, number>();
    for (const e of filteredExpenses) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
    const data: ChartEntry[] = Array.from(byCategory.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { chartData: data, total };
  }, [filteredExpenses]);

  useEffect(() => {
    if (filteredExpenses.length === 0 || !currency) {
      setInsight(null);
      setInsightLoading(false);
      return;
    }

    setInsightLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/summary-insight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              expenses: filteredExpenses,
              period,
              currency: currency.code,
            }),
          });
          if (!res.ok) throw new Error("Failed");
          const data = (await res.json()) as { insight: string };
          setInsight(data.insight);
        } catch {
          setInsight(null);
        } finally {
          setInsightLoading(false);
        }
      })();
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filteredExpenses, period, currency]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-4 flex flex-col gap-5 pb-8">

        {/* Period toggle */}
        <div
          role="radiogroup"
          aria-label="Select period"
          className="flex gap-2"
        >
          {(["weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                period === p
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500",
              )}
            >
              {p === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>

        {/* Donut chart */}
        <div className="flex justify-center">
          {currency ? (
            <DonutChart
              data={chartData}
              total={total}
              period={period}
              currency={currency}
            />
          ) : (
            <div className="w-60 h-60 rounded-full border-[24px] border-gray-100 dark:border-gray-800" />
          )}
        </div>

        {/* AI insight */}
        <InsightCard
          insight={insight}
          loading={insightLoading}
          hasExpenses={filteredExpenses.length > 0}
        />

        {/* Category breakdown */}
        {chartData.length > 0 && currency && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400">
              Category Breakdown
            </h3>
            <CategoryBreakdown
              data={chartData}
              total={total}
              currency={currency}
            />
          </div>
        )}
      </div>
    </div>
  );
}
