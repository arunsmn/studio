"use client";

import { PieChart, Pie, Cell } from "recharts";
import { CATEGORY_META } from "@/lib/categories";
import type { Currency, Category, ChartEntry } from "@/lib/types";

interface DonutChartProps {
  data: ChartEntry[];
  total: number;
  period: "weekly" | "monthly";
  currency: Currency;
}

export default function DonutChart({
  data,
  total,
  period,
  currency,
}: DonutChartProps) {
  const isEmpty = data.length === 0 || total === 0;
  const topCategory = data.length > 0 ? data[0].name : "";

  if (isEmpty) {
    return (
      <div className="relative w-60 h-60 flex items-center justify-center">
        <div className="w-full h-full rounded-full border-[24px] border-gray-100 dark:border-gray-800" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-400">No expenses</span>
          <span className="text-xs text-gray-400">
            {period === "weekly" ? "this week" : "this month"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-60 h-60"
      role="img"
      aria-label={`Spending chart: ${currency.symbol}${total.toLocaleString()} total, most spent on ${topCategory}`}
    >
      <PieChart width={240} height={240}>
        <Pie
          data={data}
          cx={120}
          cy={120}
          innerRadius={72}
          outerRadius={108}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={CATEGORY_META[entry.name as Category].chartColour}
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {currency.symbol}
          {total.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400">total</span>
      </div>
    </div>
  );
}
