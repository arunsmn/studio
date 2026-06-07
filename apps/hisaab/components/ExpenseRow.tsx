"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@studio/utils";
import { CATEGORY_META } from "@/lib/categories";
import type { Expense, Currency } from "@/lib/types";

interface ExpenseRowProps {
  expense: Expense;
  currency: Currency;
  onDelete: (id: string) => Promise<void>;
}

export default function ExpenseRow({
  expense,
  currency,
  onDelete,
}: ExpenseRowProps) {
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
      role="listitem"
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-150",
        deleting && "opacity-0 scale-95",
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", meta.colour)} />

      {confirming ? (
        <div
          aria-live="polite"
          className="flex flex-1 items-center justify-between gap-2"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Delete this expense?
          </span>
          <div className="flex gap-2 shrink-0">
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
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-900 dark:text-gray-50 truncate">
            {expense.description}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-50 tabular-nums shrink-0">
            {currency.symbol}{expense.amount.toLocaleString()}
          </span>
          <button
            onClick={() => setConfirming(true)}
            aria-label="Delete expense"
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
