"use client";

import type { Currency, Expense } from "@/lib/types";

interface HistoryTabProps {
  currency: Currency | null;
  expenses: Expense[];
  onRemove: (id: string) => Promise<void>;
}

export default function HistoryTab({ currency: _, expenses: __, onRemove: ___ }: HistoryTabProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      History — coming in Section 05
    </div>
  );
}
