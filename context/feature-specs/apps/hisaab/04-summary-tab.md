# Hisaab — Section 04: Summary Tab

## Branch

`feat/hisaab-summary-tab`

## Goal

Replace the SummaryTab stub with a working summary view: a donut chart showing
spending by category, a weekly/monthly period toggle, a category breakdown list,
and a one-sentence AI insight that explains the period's spending pattern.

---

## Layout

```
┌─────────────────────────────────┐  ← fixed top header (from page.tsx)
│ Hisaab               INR ₹      │
├─────────────────────────────────┤
│  [Weekly] [Monthly]             │  ← period toggle (pill chips)
│                                 │
│       ┌─────────────┐           │
│       │  ₹4,850     │           │  ← total in donut centre
│       │   (total)   │           │
│       └─────────────┘           │
│         donut chart             │
│                                 │
│  💡 You spent most on Food      │  ← AI insight (or skeleton)
│     this week.                  │
│                                 │
│  ─── Category Breakdown ───     │
│                                 │
│  🍽 Food          ₹2,100  43%   │
│  🚗 Transport     ₹850   18%    │
│  🛒 Groceries     ₹700   14%    │
│  ...                            │
└─────────────────────────────────┘  ← fixed bottom tab bar
```

Scrollable area between the header and tab bar. The donut chart is always
visible; the breakdown list scrolls below it.

---

## Period Toggle

Two pill chips: "Weekly" and "Monthly". Only one active at a time.

- **Weekly**: expenses from the past 7 days (today inclusive)
- **Monthly**: expenses from the past 30 days (today inclusive)

State is local to `SummaryTab` — not persisted to localStorage. Defaults to "weekly".

Date filtering is done client-side on the expenses array from `useExpenses`.

```typescript
type Period = "weekly" | "monthly";

function getDateRange(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (period === "weekly" ? 6 : 29));
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}
```

Filtering: `expense.date >= from && expense.date <= to`.

---

## Donut Chart

Uses `PieChart` + `Pie` from `recharts` with `innerRadius` to create a donut.

### Key props

```typescript
<PieChart width={240} height={240}>
  <Pie
    data={chartData}
    cx={120}
    cy={120}
    innerRadius={72}
    outerRadius={108}
    paddingAngle={2}
    dataKey="value"
  >
    {chartData.map((entry) => (
      <Cell key={entry.name} fill={CATEGORY_META[entry.name as Category].chartColour} />
    ))}
  </Pie>
</PieChart>
```

`chartData` shape:
```typescript
interface ChartEntry {
  name: Category;
  value: number; // total amount for this category
}
```

Only categories with `value > 0` appear in the chart.

### Centre label (total amount)

Recharts does not natively support a centred label inside a donut. Render it
with a `div` positioned absolutely over the chart using `relative` + `absolute`
positioning on a wrapper `div`:

```
<div className="relative w-60 h-60">
  <PieChart ... />  {/* absolute positioned */}
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
      {symbol}{total.toLocaleString()}
    </span>
    <span className="text-xs text-gray-400">total</span>
  </div>
</div>
```

### Empty donut

When no expenses exist in the period: render a light-gray ring with the text
"No expenses" in the centre. Do NOT render a `PieChart` with empty data —
it errors. Instead render a `div` styled as a ring:

```typescript
const isEmpty = chartData.length === 0 || total === 0;

if (isEmpty) {
  return (
    <div className="relative w-60 h-60 flex items-center justify-center">
      <div className="w-full h-full rounded-full border-[24px] border-gray-100 dark:border-gray-800" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm text-gray-400">No expenses</span>
        <span className="text-xs text-gray-400">{period === "weekly" ? "this week" : "this month"}</span>
      </div>
    </div>
  );
}
```

---

## AI Insight

A one-sentence plain-English observation about the period's spending.

### API Route: `apps/hisaab/app/api/summary-insight/route.ts`

```
POST /api/summary-insight
Body: {
  expenses: Expense[],  // filtered to the period
  period: "weekly" | "monthly",
  currency: string      // currency code, e.g. "INR"
}
Response: { insight: string }
```

Rate-limit and validation follow the same pattern as `/api/parse-expense`.

Validation:
- `expenses`: must be an array, max 200 items (truncate server-side if longer)
- `period`: must be "weekly" | "monthly"
- `currency`: string, 2–5 chars

The model is always Gemini for insights (no user-facing toggle for this route —
it's a background call, not interactive).

### `apps/hisaab/lib/buildInsightPrompt.ts`

```typescript
import type { Expense } from "./types";

export function buildInsightPrompt(
  expenses: Expense[],
  period: "weekly" | "monthly",
  currency: string
): string {
  const periodLabel = period === "weekly" ? "this week" : "this month";
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  const breakdown = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `${cat}: ${amt} ${currency}`)
    .join(", ");

  return `You are a friendly personal finance assistant.

Spending summary for ${periodLabel}:
Total: ${total} ${currency}
By category: ${breakdown}
Number of transactions: ${expenses.length}

Write exactly ONE sentence (max 20 words) that gives a useful, specific insight
about this spending. Be specific (mention actual category names and amounts).
Do not use filler phrases like "It looks like" or "Based on your data".
Start directly with the insight.

Return ONLY the sentence. No JSON, no markdown.`;
}
```

### `apps/hisaab/lib/parseInsight.ts`

Simple cleanup — strip markdown if any, return trimmed string.

```typescript
export function parseInsight(raw: string): string {
  return raw.replace(/[*_`#]/g, "").trim();
}
```

### Client-side fetch in `SummaryTab`

Insight is re-fetched whenever:
- The `period` toggle changes
- The `expenses` array changes (new expense added or deleted)

Use a `useEffect` with `[period, expenses]` dependency. While fetching, show
a `Skeleton` component (same height as the insight text, ~2 lines).

If the period has 0 expenses, do not call the API — show static text:
"Add some expenses to see your spending insight."

Debounce the insight API call by 500ms to avoid firing on every deletion in
rapid succession. Use `useRef` to hold the debounce timer.

---

## Category Breakdown List

Below the donut chart and insight. Lists all categories with expenses in the
period, sorted by amount descending.

Each row:
```
[icon] Category Name    ₹2,100    43%    ████████░░░░  ← progress bar
```

- Icon from `CATEGORY_META` in its category colour
- Amount: `{symbol}{amount.toFixed(0)}`
- Percentage: `(amount / total * 100).toFixed(0)%`
- Progress bar: a thin `div` with `width: {pct}%`, background matches
  `CATEGORY_META[category].chartColour` via `style={{ width, background }}`
  (inline style is required here — Tailwind cannot use dynamic values)

Only categories with a non-zero amount in the period are shown. If only one
category has expenses, the progress bar is 100%.

---

## Component Props

### `SummaryTab`

```typescript
interface SummaryTabProps {
  currency: Currency | null;
}
```

`currency` is passed down from `page.tsx` (same as `ChatTab`). `SummaryTab`
passes `currency` to both `DonutChart` (for the centre total label) and
`CategoryBreakdown` (for per-row amount formatting). When `currency` is `null`
(first visit before the picker resolves), both child components render nothing
— the currency picker modal will be open in front of them anyway.

### `DonutChart`

```typescript
interface DonutChartProps {
  data: ChartEntry[];
  total: number;
  period: Period;
  currency: Currency;
}
```

### `CategoryBreakdown`

```typescript
interface CategoryBreakdownProps {
  data: ChartEntry[];
  total: number;
  currency: Currency;
}
```

---

## Files to Create

| File | Purpose |
| ---- | ------- |
| `components/SummaryTab.tsx` | Main tab component — period toggle, chart, insight, breakdown |
| `components/DonutChart.tsx` | Recharts donut, handles empty state |
| `components/CategoryBreakdown.tsx` | Sorted list of categories with bars |
| `components/InsightCard.tsx` | AI insight text with skeleton loading state |
| `app/api/summary-insight/route.ts` | POST endpoint for AI insight generation |
| `lib/buildInsightPrompt.ts` | Builds the prompt for the insight API |
| `lib/parseInsight.ts` | Strips markdown from insight response |

---

## Accessibility

- Donut chart: `<PieChart>` wrapper `div` has `role="img"` and `aria-label`
  describing the period total and top category
- Category breakdown rows: `role="list"` on container, `role="listitem"` per row
- Progress bars: `role="progressbar"`, `aria-valuenow={pct}`, `aria-valuemin={0}`,
  `aria-valuemax={100}`, `aria-label="{category} {pct}%"`
- Period toggle: `role="radiogroup"`, each chip `role="radio"` + `aria-checked`
- AI insight: `aria-live="polite"` on the insight container so screen readers
  announce when the new insight loads

---

## Checkpoint

After this section:

1. Both period toggles filter expenses correctly
2. Donut chart renders with correct colours for each category
3. Empty state donut renders correctly when no expenses in period
4. Total amount shows correctly in the donut centre
5. AI insight loads (with skeleton while fetching) and updates when period changes
6. Category breakdown rows are sorted by amount, show correct percentage and bar
7. Adding a new expense in the Chat tab updates the Summary tab reactively
8. No TypeScript errors

---

## What Is NOT in This Section

- History tab
- CSV export
- Editing expenses
