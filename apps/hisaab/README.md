# Hisaab

**Just say what you spent. Hisaab handles the rest.**

A chat-based personal expense tracker that turns natural language into structured expense records — no forms, no categories to fill in, no friction. Built to demonstrate real-world AI integration, IndexedDB persistence, and mobile-first product thinking.

🔗 **Live:** [studio-hisaab.vercel.app](https://studio-hisaab.vercel.app)
🏠 **Studio:** [studio-root.vercel.app](https://studio-root.vercel.app)

---

## Features

- **Natural language input** — type "spent 250 on lunch" or "uber to airport 450"; Claude or Gemini parses it into a structured expense record with amount, category, description, and date
- **Dual AI providers** — switch between Claude (Haiku) and Gemini (2.5 Flash) via a model toggle; provider preference persists across sessions
- **IndexedDB persistence** — expenses survive page refreshes and browser restarts with no account required; storage is local and private
- **Auto currency detection** — detects the user's likely currency from `navigator.language` on first visit; supports 25 common currencies with a searchable picker
- **Summary tab** — weekly and monthly donut chart by category, category breakdown with progress bars, and a one-sentence AI spending insight with Gemini → Claude fallback
- **History tab** — full expense log with text search, multi-select category filter, date range picker, and grouped-by-date display
- **CSV export** — downloads the currently filtered expense set as a RFC 4180-compliant CSV; filename includes today's date
- **Inline delete** — expenses deleted directly from chat bubbles or history rows with an inline confirmation step; no modal dialogs
- **Clear all** — wipes the entire expense history with a single confirm action

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Server components, API routes, SSR with client hydration |
| Language | TypeScript (`strict: true`) | End-to-end type safety; no `any` anywhere |
| Styling | Tailwind CSS | Utility-first; dark mode via `dark:` variants; mobile-first |
| Storage | IndexedDB via `idb` | Persistent local storage; survives refresh; works offline |
| Charts | Recharts | Donut chart for category breakdown with custom centre label |
| AI — text | Anthropic `claude-haiku-4-5-20251001` | Fast, cheap, reliable JSON output |
| AI — text | Google `gemini-2.5-flash` | Free tier; default provider |
| Monorepo | pnpm workspaces + Turborepo | Shared packages, independent deployments, fast builds |
| Deployment | Vercel | Per-app projects, automatic deploys from `main` |

---

## Architecture

### Monorepo structure

```
studio/
├── apps/
│   ├── hisaab/              ← this app
│   ├── palette-ai/
│   └── root/
└── packages/
    ├── ai-core/             ← AI providers + rate limiter (server-only)
    ├── ui/                  ← shared React components
    ├── utils/               ← pure utility functions (client + server safe)
    └── tailwind-config/     ← base Tailwind config
```

Hisaab imports from shared packages but is independently deployable. No app imports from another app.

### AI provider Strategy pattern

Expense parsing uses the same Strategy pattern as PaletteAI. Adding a third provider requires one new file and one branch in the router — nothing else changes.

```
POST /api/parse-expense
  └── generateParsedExpense(options)
        ├── buildExpensePrompt(message, currency)   ← constructs the extraction prompt
        ├── claudeProvider(prompt)                  ← Anthropic SDK
        │   or geminiProvider(prompt)               ← Google GenAI SDK
        ├── parseExpense(raw)                        ← validates + types the JSON response
        └── retry once with stricter suffix on PARSE_FAILED
```

The summary insight route always tries Gemini first, then falls back to Claude automatically if Gemini is unavailable (quota, rate limit, or error). The insight route has no rate limiter — it is a background call triggered by navigation, not a user-initiated action.

### IndexedDB storage

All expenses are persisted to IndexedDB via the `idb` package. The schema is versioned and opened lazily:

- **Database:** `hisaab-db` v1
- **Object store:** `expenses` — keyPath `id`
- **Indexes:** `by-date`, `by-category` (non-unique)

All IndexedDB access is encapsulated in `lib/db.ts`. Components never call `idb` directly — they use `useExpenses` which manages both the DB and React state atomically.

### Cross-tab reactivity

`useExpenses` is called once at the `page.tsx` level and its state (`expenses`, `add`, `remove`, `clearAll`) is passed as props to all three tab components. This means when an expense is added in the Chat tab or deleted from the History tab, the Summary tab re-renders immediately without reading from IndexedDB again.

### Currency detection

On first visit, the app reads `navigator.language` and maps the locale's region subtag to a currency code:

```ts
const locale = navigator.language ?? "en-US";       // e.g. "en-IN"
const region = locale.split("-")[1]?.toUpperCase(); // "IN"
const code = LOCALE_TO_CURRENCY[region] ?? "USD";   // "INR"
```

The detected currency is pre-selected in the picker but never auto-saved — the user always confirms. The choice is persisted to `localStorage` under `studio:budget-currency`.

### Client-side CSV export

No API call — the export runs entirely in the browser using `Blob` and `URL.createObjectURL`. The exported rows reflect whichever filters are active at the time of export:

```ts
const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `hisaab-export-${today}.csv`;
a.click();
URL.revokeObjectURL(url);
```

Description fields are wrapped in double-quotes with embedded quotes doubled per RFC 4180.

### Rate limiting

Three-layer defence (for `/api/parse-expense`):

1. **Anthropic dashboard** — hard $5/month spend cap (zero code)
2. **In-memory Map** — per-IP 10 s cooldown + 100 req/day global cap (server, resets on cold start)
3. **Client error state** — error message shown above the input when rate limited

The summary insight route (`/api/summary-insight`) skips the in-memory rate limiter because it is triggered automatically by navigation and tab switching — not by direct user action.

### API key isolation

AI SDKs are imported exclusively inside `packages/ai-core/src/` and `app/api/*/route.ts` files. They never reach components, hooks, or the browser.

---

## Key Engineering Decisions

**Why IndexedDB instead of localStorage?**
localStorage is synchronous, has a 5 MB limit, and stores only strings. IndexedDB is async, handles structured data natively, and scales to thousands of records. The `idb` package provides a clean Promise-based wrapper without the verbosity of the raw API.

**Why is `useExpenses` lifted to `page.tsx`?**
All three tabs are always mounted (just hidden with CSS) so they share state instantly. If each tab called `useExpenses` independently, a Chat tab addition wouldn't update the Summary tab until the next IndexedDB read. Lifting the hook to `page.tsx` makes all tabs reactive to the same state.

**Why no rate limiter on the insight route?**
The insight is a background call that fires automatically when the user switches to the Summary tab or adds an expense. Rate-limiting it caused confusing 429 errors when users navigated between tabs quickly after adding expenses. The Anthropic hard cap is the real safety net for background calls.

**Why Gemini → Claude fallback for insights?**
Gemini's free tier has a 20 req/day cap on `gemini-2.5-flash`. For a portfolio app used during demos, this cap is easily hit. The automatic fallback means the insight always loads without requiring the user to manually switch providers.

**Why `useEffect` for localStorage reads instead of lazy `useState`?**
Next.js server-renders client components for the initial HTML. A lazy `useState` initializer that reads `localStorage` returns the default value on the server but a different value on the client — causing React hydration mismatches. The `useEffect` pattern starts with matching server/client defaults and updates after hydration.

---

## Roadmap

### ✅ Phase 1 — Core (shipped)
- Natural language expense parsing via Claude and Gemini
- IndexedDB persistence with no account required
- Chat-style expense feed with inline delete
- Currency picker with locale auto-detection (25 currencies)
- Summary tab with donut chart and AI spending insight
- History tab with search, category filter, date range, and CSV export
- Clear all expenses with confirmation

### 🔜 Phase 2 — Smarter tracking (planned)
- **Receipt photo scan** — upload a photo of a receipt; vision AI extracts line items as multiple expenses
- **Recurring expense detection** — AI notices patterns ("you pay this every month") and offers to mark them recurring
- **Budget goals** — set a monthly limit per category; progress bar turns red when approaching the limit
- **Upstash Redis rate limiter** — replace in-memory Map so limits survive Vercel cold starts

### 💡 Future ideas
- Multi-device sync via a lightweight backend (Cloudflare D1 or Supabase)
- Voice input — browser `SpeechRecognition` API to dictate expenses hands-free
- WhatsApp / Telegram bot — send expense messages to a bot, synced to the web app

---

## Local Development

```bash
# Prerequisites: Node 18+, pnpm 9+

git clone https://github.com/arunsmn/studio.git
cd studio
pnpm install

# Add API keys (copy to apps/hisaab/.env.local)
cp .env.example apps/hisaab/.env.local
# Fill in ANTHROPIC_API_KEY and GEMINI_API_KEY

# Run Hisaab
pnpm dev --filter=@studio/hisaab
# → http://localhost:3002

# Build check
pnpm build --filter=@studio/hisaab
```

---

## Project Structure

```
apps/hisaab/
├── app/
│   ├── page.tsx                        ← main page, tab state, useExpenses lifted here
│   ├── layout.tsx                      ← Inter font, dark mode default, metadata
│   ├── globals.css
│   └── api/
│       ├── parse-expense/route.ts      ← AI expense parsing endpoint
│       └── summary-insight/route.ts    ← AI spending insight endpoint (Gemini → Claude)
├── components/
│   ├── ChatTab.tsx                     ← expense feed, input bar, model toggle
│   ├── ExpenseBubble.tsx               ← individual expense bubble with inline delete
│   ├── SummaryTab.tsx                  ← period toggle, chart, insight, breakdown
│   ├── DonutChart.tsx                  ← Recharts donut with empty state
│   ├── CategoryBreakdown.tsx           ← sorted category list with progress bars
│   ├── InsightCard.tsx                 ← AI insight with skeleton loading
│   ├── HistoryTab.tsx                  ← search, filters, grouped list, CSV export
│   ├── ExpenseRow.tsx                  ← history row with inline delete
│   ├── CategoryFilterChips.tsx         ← multi-select category filter chips
│   ├── DateGroupHeader.tsx             ← date section divider
│   └── CurrencyPickerModal.tsx         ← bottom sheet currency picker
├── hooks/
│   ├── useExpenses.ts                  ← IndexedDB CRUD + React state
│   ├── useCurrency.ts                  ← localStorage currency read/write
│   └── useChatModel.ts                 ← localStorage model preference
├── lib/
│   ├── types.ts                        ← Expense, Currency, Category, ParsedExpense
│   ├── db.ts                           ← idb wrapper (addExpense, deleteExpense, getAll, clearAll)
│   ├── buildExpensePrompt.ts           ← expense extraction prompt
│   ├── parseExpense.ts                 ← response parser + validator
│   ├── buildInsightPrompt.ts           ← spending insight prompt
│   ├── parseInsight.ts                 ← strips markdown from insight response
│   ├── categories.ts                   ← CATEGORY_META (icon, colour, chartColour)
│   ├── currencies.ts                   ← 25 currencies + locale detection
│   ├── exportCsv.ts                    ← client-side CSV generation
│   ├── groupByDate.ts                  ← groups Expense[] into date-labelled groups
│   └── providers/
│       └── index.ts                    ← generateParsedExpense() strategy router
└── vercel.json                         ← monorepo build config for Vercel
```
