# Hisaab — Section 05: History Tab

## Branch

`feat/hisaab-history-tab`

## Goal

Replace the HistoryTab stub with a full expense history view: searchable,
filterable by category and date range, with CSV export. Delete is also
available from this view.

---

## Layout

```
┌─────────────────────────────────┐  ← fixed top header (from page.tsx)
│ Hisaab               INR ₹      │
├─────────────────────────────────┤
│ [🔍 Search expenses...]         │  ← search input
│                                 │
│ [Food] [Transport] [Groceries]  │  ← category filter chips (scrollable row)
│ [Shopping] [Entertainment] ...  │
│                                 │
│ From [2026-06-01] To [2026-06-05]│  ← date range pickers
│                                 │
│ 12 expenses  [↓ Export CSV]     │  ← count + export button
├─────────────────────────────────┤
│                                 │
│ ── 5 Jun 2026 ──────────────── │  ← date group header
│ [🍽] Lunch at Subway   ₹250 [🗑]│
│ [🚗] Uber to airport   ₹450 [🗑]│
│                                 │
│ ── 4 Jun 2026 ──────────────── │
│ [🛒] Big Bazaar       ₹1,200 [🗑]│
│                                 │
└─────────────────────────────────┘  ← fixed bottom tab bar
```

---

## Filters

All filters are applied client-side. The full expense list from `useExpenses`
is filtered in a derived value (not a separate state):

```typescript
const filteredExpenses = useMemo(() => {
  return expenses
    .filter(e => {
      if (searchQuery && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (activeCategories.size > 0 && !activeCategories.has(e.category)) {
        return false;
      }
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}, [expenses, searchQuery, activeCategories, dateFrom, dateTo]);
```

### Search

- Single text input at the top of the History tab
- Filters by `expense.description` (case-insensitive substring match)
- Clears with an X button that appears when `searchQuery.length > 0`
- `aria-label="Search expenses"`

### Category Filter Chips

- Horizontally scrollable row of pill chips (one per category)
- Multi-select: tapping a chip toggles it; multiple can be active at once
- Active chip: `bg-violet-600 text-white border-violet-600`
- Inactive chip: `border-gray-200 text-gray-600 bg-white dark:bg-gray-900 dark:border-gray-700`
- "All" is the implicit state when `activeCategories.size === 0` — no "All" chip needed
- Chips with zero matching expenses in the current search/date range are NOT
  greyed out or hidden — all 9 categories always appear
- State: `activeCategories: Set<Category>` in local component state

### Date Range

- Two date inputs: "From" and "To"
- `<input type="date" />` — native HTML date picker
- Default: both empty (no date filter)
- "From" and "To" are independent — either can be set without the other
- Validation: if `dateFrom > dateTo`, show a small red error message:
  "'From' date must be before 'To' date" and disable export button

---

## Expense List (Grouped by Date)

Expenses are grouped by `expense.date` and displayed with a date group header.

```typescript
interface ExpenseGroup {
  date: string;       // "YYYY-MM-DD"
  label: string;      // "Today", "Yesterday", "5 Jun 2026"
  expenses: Expense[];
}
```

Date label logic:
- Today's date → "Today"
- Yesterday's date → "Yesterday"
- Otherwise → `"D MMM YYYY"` (e.g. "3 Jun 2026") using `Date.toLocaleDateString`
  with `{ day: "numeric", month: "short", year: "numeric" }`

### Expense Row

```
┌─────────────────────────────────────────┐
│ [icon] description       ₹amount  [🗑] │
└─────────────────────────────────────────┘
```

- Icon from `CATEGORY_META` in category colour (`w-5 h-5`)
- Description: `text-sm text-gray-900 dark:text-gray-50`, truncated with `truncate`
- Amount: `text-sm font-medium text-gray-900 dark:text-gray-50` right-aligned
- Delete icon (`Trash2`, `w-4 h-4 text-gray-400`), tap to start inline confirmation

**Inline Delete Confirmation (same pattern as chat bubble):**

Tapping the trash icon morphs the row into:
```
│ [icon] description    [Cancel] [Delete] │
```
- Two small buttons inline — `ghost` Cancel and a red-text Delete
- Confirming calls `remove(expense.id)` from `useExpenses`
- The row fades out (`opacity-0`, 150ms transition) before unmounting

---

## Result Count and Export Row

Shown between the filters and the list:

```
12 expenses  [↓ Export CSV]
```

- Left: `"{n} expense{n !== 1 ? 's' : ''}"` in `text-sm text-gray-500`
- Right: Export CSV button — `ghost` variant, small size
- When `filteredExpenses.length === 0`: export button is hidden (nothing to export)
- When date range is invalid: export button is disabled

---

## CSV Export

### Client-side only — no API call

```typescript
function exportToCSV(expenses: Expense[], currency: Currency): void {
  const header = "Date,Description,Category,Amount,Currency";
  const rows = expenses.map(e =>
    [e.date, `"${e.description.replace(/"/g, '""')}"`, e.category, e.amount, currency.code].join(",")
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
```

Exported rows are in the same order as `filteredExpenses` (sorted by date
descending, applying all active filters). If the user has filters active,
only the filtered set is exported — this is intentional and communicated by
the button label "Export {n} rows" when filters are active, "Export CSV" when all.

### Escaping rules

- `description` is wrapped in double-quotes; any embedded double-quotes are
  doubled (`""`) per RFC 4180
- `amount` is a raw number (no currency symbol, no comma formatting)
- `date` is ISO format `YYYY-MM-DD`
- All other fields are plain strings with no special characters expected

---

## Empty States

### No expenses at all

```
┌─────────────────────────────────┐
│                                 │
│           📋                    │
│   No expenses yet               │
│   Head to the Chat tab to       │
│   add your first expense.       │
│                                 │
└─────────────────────────────────┘
```

### Filters active but no matches

```
┌─────────────────────────────────┐
│                                 │
│           🔍                    │
│   No expenses match             │
│   Try adjusting your filters    │
│                                 │
│       [Clear all filters]       │
│                                 │
└─────────────────────────────────┘
```

"Clear all filters" resets `searchQuery`, `activeCategories`, `dateFrom`, `dateTo`.

---

## Component Props

### `HistoryTab`

```typescript
interface HistoryTabProps {
  currency: Currency | null;
}
```

`currency` is passed from `page.tsx` (same pattern as `ChatTab` and `SummaryTab`).
When `currency` is `null`, `HistoryTab` renders nothing — the currency picker
modal is open in front of it. `HistoryTab` passes a non-null `currency` down
to `ExpenseRow` and `exportToCSV` only after guarding: `if (!currency) return null`.

### `ExpenseRow`

```typescript
interface ExpenseRowProps {
  expense: Expense;
  currency: Currency;     // non-nullable — only rendered when currency is known
  onDelete: (id: string) => Promise<void>;
}
```

Amount is formatted as `{currency.symbol}{expense.amount.toLocaleString()}`.
`ExpenseRow` never receives a null currency because `HistoryTab` guards before
rendering the list.

---

## Files to Create

| File | Purpose |
| ---- | ------- |
| `components/HistoryTab.tsx` | Main tab — owns all filter state, renders list |
| `components/ExpenseRow.tsx` | Single expense row with inline delete confirmation |
| `components/DateGroupHeader.tsx` | Section header between date groups |
| `components/CategoryFilterChips.tsx` | Horizontally scrollable filter chip row |
| `lib/exportCsv.ts` | `exportToCSV` utility function |
| `lib/groupByDate.ts` | Groups `Expense[]` into `ExpenseGroup[]` |

---

## `apps/hisaab/lib/groupByDate.ts`

```typescript
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
      label: date === today ? "Today" : date === yesterday ? "Yesterday" : formatDate(date),
      expenses: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }));
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
```

---

## Accessibility

- Search input: `aria-label="Search expenses"`, clear button `aria-label="Clear search"`
- Category chips: `role="group"` on container with `aria-label="Filter by category"`,
  each chip `role="checkbox"` + `aria-checked`
- Date inputs: proper `<label>` elements — "From date" and "To date"
- Expense list: `role="list"` on the outer list, `role="listitem"` per row
- Delete confirmation: `aria-live="polite"` on the confirmation prompt region
- Export button: `aria-label="Export {n} expenses as CSV"`

---

## Checkpoint

After this section:

1. All expenses from IndexedDB appear grouped by date
2. Search filters by description in real time
3. Category filter chips: multi-select, active chips filter list
4. Date range: From/To filters the list; invalid range shows error message
5. Export CSV: downloads a correctly formatted `.csv` file
6. Export only includes currently filtered rows
7. Filename includes today's date
8. Inline delete confirmation works; deleted row fades out
9. Both empty states render correctly
10. No TypeScript errors

---

## What Is NOT in This Section

- Editing an expense (Phase 1: delete only)
- Bulk delete
- Pagination (all expenses shown; IndexedDB datasets are small for personal use)
