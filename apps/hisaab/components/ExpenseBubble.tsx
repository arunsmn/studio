"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@studio/utils";
import { CATEGORY_META } from "@/lib/categories";
import type { Expense, Currency } from "@/lib/types";

interface ExpenseBubbleProps {
  expense: Expense;
  currency: Currency;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  const date = new Date(dateStr + "T00:00:00");
  const formatted = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (dateStr === today) return `Today, ${formatted}`;
  if (dateStr === yesterday) return `Yesterday, ${formatted}`;
  return formatted;
}

export default function ExpenseBubble({
  expense,
  currency,
  onDelete,
}: ExpenseBubbleProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meta = CATEGORY_META[expense.category];
  const Icon = meta.Icon;

  async function handleDelete() {
    setDeleting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 150));
    await onDelete(expense.id);
  }

  return (
    <div
      className={cn(
        "self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 transition-all duration-150",
        deleting && "opacity-0 scale-95",
      )}
    >
      {confirming ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Delete this expense?
          </span>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg px-2.5 py-1 transition-colors"
          >
            Delete
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4 shrink-0", meta.colour)} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {expense.category}
              </span>
            </div>
            <button
              onClick={() => setConfirming(true)}
              aria-label="Delete expense"
              className="text-gray-400 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">
            {expense.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDate(expense.date)} · {currency.symbol}
            {expense.amount.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
}
