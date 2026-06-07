"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, Download, ClipboardList } from "lucide-react";
import { cn } from "@studio/utils";
import { Button } from "@studio/ui";
import CategoryFilterChips from "./CategoryFilterChips";
import DateGroupHeader from "./DateGroupHeader";
import ExpenseRow from "./ExpenseRow";
import { groupByDate } from "@/lib/groupByDate";
import { exportToCSV } from "@/lib/exportCsv";
import { ALL_CATEGORIES } from "@/lib/categories";
import type { Currency, Expense, Category } from "@/lib/types";

interface HistoryTabProps {
  currency: Currency | null;
  expenses: Expense[];
  onRemove: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export default function HistoryTab({
  currency,
  expenses,
  onRemove,
  onClearAll,
}: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(),
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);

  const isDateRangeInvalid = !!(dateFrom && dateTo && dateFrom > dateTo);

  const filteredExpenses = useMemo(
    () =>
      expenses
        .filter((e) => {
          if (
            searchQuery &&
            !e.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }
          if (activeCategories.size > 0 && !activeCategories.has(e.category)) {
            return false;
          }
          if (dateFrom && e.date < dateFrom) return false;
          if (dateTo && e.date > dateTo) return false;
          return true;
        })
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt.localeCompare(a.createdAt),
        ),
    [expenses, searchQuery, activeCategories, dateFrom, dateTo],
  );

  const groups = useMemo(
    () => groupByDate(filteredExpenses),
    [filteredExpenses],
  );

  if (!currency) return null;

  const hasFilters =
    searchQuery.length > 0 ||
    activeCategories.size > 0 ||
    !!dateFrom ||
    !!dateTo;

  function toggleCategory(category: Category): void {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function clearFilters(): void {
    setSearchQuery("");
    setActiveCategories(new Set());
    setDateFrom("");
    setDateTo("");
  }

  function handleExport(): void {
    exportToCSV(filteredExpenses, currency);
  }

  const exportLabel = hasFilters
    ? `Export ${filteredExpenses.length} rows`
    : "Export CSV";

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex-none px-4 pt-4 pb-3 flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            aria-label="Search expenses"
            className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <CategoryFilterChips
          activeCategories={activeCategories}
          onToggle={toggleCategory}
        />

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <label
              htmlFor="date-from"
              className="text-xs text-gray-500 dark:text-gray-400 shrink-0"
            >
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="From date"
              className="flex-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <label
              htmlFor="date-to"
              className="text-xs text-gray-500 dark:text-gray-400 shrink-0"
            >
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="To date"
              className="flex-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {isDateRangeInvalid && (
          <p className="text-xs text-red-500">
            &apos;From&apos; date must be before &apos;To&apos; date
          </p>
        )}

        {/* Count + export + clear all */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1 ? "expense" : "expenses"}
          </span>
          <div className="flex items-center gap-2">
            {filteredExpenses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                disabled={isDateRangeInvalid}
                aria-label={`Export ${filteredExpenses.length} expenses as CSV`}
              >
                <Download className="w-3.5 h-3.5" />
                {exportLabel}
              </Button>
            )}
            {expenses.length > 0 && (
              confirmingClearAll ? (
                <div className="flex items-center gap-1.5" aria-live="polite">
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    Clear all?
                  </span>
                  <button
                    onClick={() => setConfirmingClearAll(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setConfirmingClearAll(false);
                      await onClearAll();
                    }}
                    className="text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg px-2 py-1 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingClearAll(true)}
                  className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Expense list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              No expenses yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Head to the Chat tab to add your first expense.
            </p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Search className="w-10 h-10 text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              No expenses match
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Try adjusting your filters
            </p>
            <button
              onClick={clearFilters}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-1"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div role="list" className="flex flex-col gap-1 pb-4">
            {groups.map((group) => (
              <div key={group.date}>
                <div className="pt-2 pb-1">
                  <DateGroupHeader label={group.label} />
                </div>
                <div className="flex flex-col gap-1">
                  {group.expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      currency={currency}
                      onDelete={onRemove}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
