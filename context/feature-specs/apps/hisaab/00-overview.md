# Hisaab — Full App Overview

## What It Is

Hisaab (Hindi: "account / reckoning") is a chat-based personal expense tracker.
Users describe what they spent in plain language; AI parses the message into a
structured expense record and saves it locally. No sign-up, no cloud sync.

**Tagline:** "Just say what you spent. Hisaab handles the rest."

**Category:** app  
**Port:** 3002  
**Package name:** `@studio/hisaab`  
**App directory:** `apps/hisaab/`

---

## Target Users

- Anyone who wants to track expenses without a form
- Mobile-first: one-thumb input while paying at a counter
- Non-technical users — no financial jargon

---

## Core Loop

1. User types a message in the chat tab ("spent 250 on lunch")
2. App sends to `/api/parse-expense` → AI returns structured JSON
3. Expense saved to IndexedDB via `idb` package
4. Expense bubble appears in chat
5. Summary and History tabs update reactively

---

## Tab Structure

Three tabs in a fixed bottom tab bar (mobile-first):

| Tab     | Icon          | Path (client state, not URL routing) |
| ------- | ------------- | ------------------------------------ |
| Chat    | MessageCircle | default tab                          |
| Summary | PieChart      | second tab                           |
| History | List          | third tab                            |

Tab state is held in React state on `app/page.tsx` — not URL segments.
All three tab panels are mounted; inactive tabs are hidden with `hidden` class
so IndexedDB reads do not need to re-run on tab switch.

---

## Data Shape

### `Expense` (the core record)

```typescript
interface Expense {
  id: string; // crypto.randomUUID() — generated client-side
  amount: number; // positive number, in user's selected currency
  category: Category;
  description: string; // AI-generated or user-edited (not editable in Phase 1)
  date: string; // ISO date "YYYY-MM-DD" — AI infers from message or defaults to today
  createdAt: string; // ISO timestamp of when the record was saved
  model: AIModel; // "claude" | "gemini" — which AI parsed it
}
```

### `Category` (fixed union — no custom categories in Phase 1)

```typescript
type Category =
  | "Food"
  | "Transport"
  | "Groceries"
  | "Shopping"
  | "Entertainment"
  | "Bills & Recharge"
  | "EMI & Rent"
  | "Health"
  | "Others";
```

### `Currency`

```typescript
interface Currency {
  code: string; // ISO 4217 — "INR", "USD", "EUR"
  symbol: string; // "₹", "$", "€"
  name: string; // "Indian Rupee"
}
```

### `ParsedExpense` (AI response shape)

```typescript
interface ParsedExpense {
  amount: number;
  category: Category;
  description: string;
  date: string; // "YYYY-MM-DD"
}
```

---

## Category Metadata

Used for colours and icons in bubbles, chart, and history list.

| Category         | Colour token      | Lucide icon     |
| ---------------- | ----------------- | --------------- |
| Food             | `text-orange-500` | UtensilsCrossed |
| Transport        | `text-blue-500`   | Car             |
| Groceries        | `text-green-500`  | ShoppingCart    |
| Shopping         | `text-pink-500`   | ShoppingBag     |
| Entertainment    | `text-purple-500` | Tv              |
| Bills & Recharge | `text-yellow-500` | Zap             |
| EMI & Rent       | `text-red-500`    | Home            |
| Health           | `text-teal-500`   | Heart           |
| Others           | `text-gray-400`   | MoreHorizontal  |

This mapping lives in `lib/categories.ts` and is imported wherever icons or
colours are needed. Never hardcode category colours inline.

---

## Currency Picker

- Shown as a modal on first visit (no `studio:budget-currency` in localStorage)
- Auto-detects a suggestion from `navigator.language` using locale-to-currency map
- User confirms or selects a different currency from a list of 25 common ones
- Saved to `localStorage` under key `studio:budget-currency`
- Format saved: `{ code: "INR", symbol: "₹", name: "Indian Rupee" }`
- User can re-open via a currency chip in the header

---

## AI Parsing Flow

```
ChatInput (client)
  └── POST /api/parse-expense
        ├── checkRateLimit(ip)
        ├── validate: message (string, 2–500 chars), model, currency
        ├── buildExpensePrompt(message, currency, today's date)
        ├── claudeProvider | geminiProvider  ← Strategy pattern
        ├── parseExpense(raw)                ← validates JSON shape + category
        └── return ParsedExpense JSON

ChatTab (client)
  └── receives ParsedExpense
        ├── merges with { id, createdAt }
        ├── saves to IndexedDB via useExpenses hook
        └── prepends to chat bubble list
```

- Gemini is the default provider
- Model toggleable via `ModelToggle` in the chat tab header
- Provider preference stored in `localStorage` key `studio:preferred-model`
  (same key as PaletteAI — shared across Studio apps intentionally)
- If AI returns an unrecognised category, fall back to `"Others"`
- If AI returns an amount of 0 or negative, return 400 to the client

---

## IndexedDB Schema (via `idb` package)

Database name: `"hisaab-db"`  
Version: `1`

### Object Store: `"expenses"`

| Field         | Type   | Index?                             |
| ------------- | ------ | ---------------------------------- |
| `id`          | string | primary key (keyPath)              |
| `date`        | string | index `"by-date"` (non-unique)     |
| `category`    | string | index `"by-category"` (non-unique) |
| `amount`      | number | —                                  |
| `description` | string | —                                  |
| `createdAt`   | string | —                                  |

All reads use `getAll()` and filter/sort client-side — no compound indexes in
Phase 1. The dataset is small (personal expense tracker, not analytics engine).

The `idb` package wrapper lives in `lib/db.ts`. All IndexedDB calls are
encapsulated in the `useExpenses` hook — never call `idb` directly from components.

---

## localStorage Keys

| Key                      | Value shape              | Set by              |
| ------------------------ | ------------------------ | ------------------- |
| `studio:budget-currency` | `Currency` object (JSON) | CurrencyPickerModal |
| `studio:preferred-model` | `"gemini" \| "claude"`   | ModelToggle         |

---

## CSV Export Format

Triggered by a button on the History tab.

Filename: `hisaab-export-YYYY-MM-DD.csv` (date = today)

Columns (in order):

```
Date,Description,Category,Amount,Currency
2026-06-05,Lunch at Subway,Food,250,INR
2026-06-04,Uber to office,Transport,180,INR
```

- `Date` = `expense.date` (YYYY-MM-DD)
- `Amount` = raw number (no symbol, no formatting)
- `Currency` = `currency.code`
- Rows sorted by `date` descending (newest first)
- Only exports the currently filtered set when filters are active

Export is client-side only — no API call. Uses `Blob` + `URL.createObjectURL`.

---

## No Edit, Delete Only

- Phase 1: expenses cannot be edited after creation
- Delete is permanent — confirmed via an inline confirmation step in the UI
  (not a browser `confirm()` dialog)
- Delete available on both chat bubbles and history list rows

---

## What Is Not In Scope (Phase 1)

- User accounts or cloud sync
- Recurring expenses or budgets
- Multi-currency expenses (all in one chosen currency)
- Editing an expense after creation
- Push notifications or reminders
- Analytics beyond weekly/monthly summary
