import type { Expense, Currency } from "./types";

export function exportToCSV(expenses: Expense[], currency: Currency): void {
  const header = "Date,Description,Category,Amount,Currency";
  const rows = expenses.map((e) =>
    [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      currency.code,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hisaab-export-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
