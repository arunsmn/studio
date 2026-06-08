import type { Expense } from "./types";

export interface ExpenseGroup {
  date: string;
  label: string;
  expenses: Expense[];
}

export function groupByDate(expenses: Expense[]): ExpenseGroup[] {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  const map = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const existing = map.get(expense.date) ?? [];
    existing.push(expense);
    map.set(expense.date, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label:
        date === today
          ? "Today"
          : date === yesterday
            ? "Yesterday"
            : formatGroupDate(date),
      expenses: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }));
}

function formatGroupDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
