# Progress Tracker

> Update this file after every meaningful implementation change.
> This is the file Claude reads to understand where we left off.

---

## Current Phase

**Hisaab build** (complete — all sections live on Vercel)

---

## Status by Section

| Section                                | Branch                              | Status      | Notes               |
| -------------------------------------- | ----------------------------------- | ----------- | ------------------- |
| 01 — Monorepo scaffold                 | feat/monorepo-scaffold              | ✅ Complete | Merged to develop   |
| 02 — Shared packages                   | feat/shared-packages                | ✅ Complete | Merged to develop   |
| 03 — Root site                         | feat/root-site                      | ✅ Complete | Merged to develop   |
| 04 — Shared UI components              | feat/shared-ui-components           | ✅ Complete | Merged to develop   |
| 05 — PaletteAI API layer               | feat/palette-ai-api                 | ✅ Complete | Merged to develop   |
| 06 — PaletteAI input + swatches        | feat/palette-ai-ui-input-swatches   | ✅ Complete | Merged to develop   |
| 07 — PaletteAI page + preview + export | feat/palette-ai-page-preview-export | ✅ Complete | Merged to develop   |
| 08 — Tests + polish                    | feat/palette-ai-tests-polish        | ✅ Complete | Merged to develop   |
| 09 — Vercel deployment                 | feat/vercel-deployment              | ✅ Complete | Merged to develop   |
| 10a — Shareable URL                    | feat/palette-ai-shareable-url       | ✅ Complete | Merged to develop   |
| 10b — Image upload                     | feat/palette-ai-image-upload        | ✅ Complete | Merged to develop   |
| **Hisaab**                             |                                     |             |                     |
| H00 — Specs                            | —                                   | ✅ Complete | All 6 specs written |
| H01 — Scaffold                         | feat/hisaab-scaffold                | ✅ Complete | Merged to develop   |
| H02 — Currency picker                  | feat/hisaab-currency-picker         | ✅ Complete | Merged to develop   |
| H03 — Chat tab                         | feat/hisaab-chat-tab                | ✅ Complete | Merged to develop   |
| H04 — Summary tab                      | feat/hisaab-summary-tab             | ✅ Complete | Merged to develop   |
| H05 — History tab + CSV export         | feat/hisaab-history-tab             | ✅ Complete | Merged to develop   |
| H06 — Vercel deployment                | —                                   | ✅ Complete | Live on Vercel      |

Status key: ⬜ Not started · 🔄 In progress · ✅ Complete · ❌ Blocked

---

## Completed Work

### Section 01 — Monorepo scaffold (feat/monorepo-scaffold)

- Created `package.json` (root) with pnpm workspaces, turbo scripts, devDeps
- Created `pnpm-workspace.yaml` with apps/_ and packages/_ globs
- Created `turbo.json` (v2) with build/dev/lint/test tasks + globalEnv passthrough
- Created `tsconfig.base.json` with strict: true, ES2022, moduleResolution: bundler
- Updated `.gitignore` to cover node_modules, .next, dist, .turbo, .env*.local, *.tsbuildinfo
- Created `.env.example` with all four required env var keys

### Section 02 — Shared packages (feat/shared-packages)

- `packages/tailwind-config`: package.json + tailwind.config.base.ts (darkMode, Inter font, pulse-slow animation, screens)
- `packages/utils`: cn(), hexToRgb, hexToHSL, getContrastRatio, getTextColour, isWCAGAA, isWCAGAAA, encodeState, decodeState
- `packages/ui`: scaffold only — package.json, tsconfig, empty index (components added in Section 04)
- `packages/ai-core`: AIModel/ProviderFn/RateLimitResult types, claudeProvider (claude-haiku-4-5-20251001), geminiProvider (gemini-2.0-flash), checkRateLimit (in-memory, 10s cooldown, 100/day cap — no Upstash, Phase 1 decision)

### Section 03 — Root showcase site (feat/root-site)

- `apps/root/package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`
- `app/layout.tsx`: Inter font, dark mode html class, metadata
- `app/page.tsx`: server component — renders HeroSection + AppGallery
- `app/globals.css`: Tailwind directives
- `data/apps.ts`: AppEntry interface + APPS array (PaletteAI, coming-soon)
- `components/HeroSection.tsx`: headline + subline, no animation
- `components/AppGallery.tsx`: client wrapper — owns filter state, renders FilterBar + AppGrid
- `components/FilterBar.tsx`: All / Apps / Tools / Games pill tabs
- `components/AppGrid.tsx`: filtered grid of AppCards, empty state
- `components/AppCard.tsx`: lucide icon, name, tagline, category badge, coming-soon pill, live link

### Section 04 — Shared UI components (feat/shared-ui-components)

- `Button`: primary/ghost/pill variants, sm/md/lg sizes, loading spinner (Loader2)
- `PillChip`: radio-style selectable chip, Enter/Space keyboard toggle
- `CopyButton`: clipboard copy with 1500ms "Copied!" feedback, sm/md sizes
- `ModelToggle`: Gemini (green dot) / Claude (purple dot) pill toggle, writes to localStorage
- `Skeleton`: animate-pulse rectangles, configurable count/height/width
- `ErrorState`: AlertCircle icon, message, optional retry button
- `AppShell`: sticky topbar (Studio / app title / optional back link), full-height layout
- Updated `packages/ui/package.json`: added @studio/utils, lucide-react deps

### Section 05 — PaletteAI API layer (feat/palette-ai-api)

- `apps/palette-ai/package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- `lib/types.ts`: Colour, PaletteOptions, Palette interfaces
- `lib/buildPrompt.ts`: builds full prompt from all PaletteOptions fields
- `lib/parseColours.ts`: strips fences, JSON.parse, validates hex + usage, throws PARSE_FAILED
- `lib/providers/index.ts`: generatePalette() strategy router with one retry on PARSE_FAILED
- `lib/providers/claudeProvider.ts`: re-exports from @studio/ai-core
- `lib/providers/geminiProvider.ts`: re-exports from @studio/ai-core
- `lib/providers/types.ts`: re-exports AIModel, ProviderFn
- `app/api/generate/route.ts`: POST — rate limit → validate → generatePalette → return JSON

### Section 06 — PaletteAI input + swatches (feat/palette-ai-ui-input-swatches)

- `hooks/usePalette.ts`: fetch wrapper with loading, error, 10s cooldown state
- `hooks/useHistory.ts`: localStorage read/write for palette history (max 20)
- `components/MoodInput.tsx`: textarea + tone/useCase/audience/theme/count chips + ModelToggle + Generate button
- `components/BannerStrip.tsx`: expandable colour segments with hover flex grow
- `components/SwatchCard.tsx`: colour block, name, hex, usage, copy button
- `components/LabelList.tsx`: mobile 5-colour list with WCAG badges
- `components/ScrollCards.tsx`: mobile 8-colour horizontal scroll with snap
- `components/DetailPanel.tsx`: tap-to-expand HSL, contrast, WCAG AA/AAA, rationale
- `components/SwatchGrid.tsx`: desktop row + mobile layout switch at md breakpoint
- `components/SkeletonGrid.tsx`: pulsing placeholders matching swatch layout

### Section 07 — PaletteAI page + preview + export (feat/palette-ai-page-preview-export)

- `components/LivePreview.tsx`: fake UI with Card / Dashboard / Landing layout modes; colours applied via inline styles; mode toggle above preview; smooth `transition-colors duration-300` on palette change
- `components/ExportPanel.tsx`: CSS (hex + HSL toggle) / Tailwind / JSON tabs; per-tab CopyButton; uses `hexToHSL` from `@studio/utils`
- `components/HistoryDrawer.tsx`: slide-in right drawer (z-50, backdrop overlay); Escape-key close; mini BannerStrip per entry; relative timestamps; model badge (claude/gemini); clear all button
- `app/page.tsx`: wires LivePreview + ExportPanel + HistoryDrawer; saves each generated palette to history via `useHistory`; history-restore sets activePalette without re-fetching; history button in AppShell topbar shows count badge
- `packages/ui/src/AppShell.tsx`: added optional `actions?: React.ReactNode` slot to topbar (additive, non-breaking)

---

### Section 08 — Tests + polish (feat/palette-ai-tests-polish)

- `vitest.config.ts`: updated with `resolve.alias` for `@studio/ui`, `@studio/utils`, `@studio/ai-core`; added `jsdom` to devDependencies
- `__tests__/parseColours.test.ts`: 18 tests — happy path, markdown fence stripping, prose stripping, count mismatch, invalid hex, invalid usage, missing fields, malformed JSON, null items
- `__tests__/buildPrompt.test.ts`: 10 tests — mood presence, all fields, JSON-only instruction, all usage values, count boundaries (3/5/8), edge cases
- `__tests__/generatePalette.test.ts`: 8 tests — gemini/claude routing, prompt pass-through, retry on PARSE_FAILED, retry suffix, both-fail propagation, shape validation, non-parse error propagation; providers mocked with `vi.mock`
- `__tests__/colourUtils.test.ts`: 23 tests — hexToRgb (5), hexToHSL (4), getContrastRatio (3), getTextColour (4), isWCAGAA (3), isWCAGAAA (4)
- `__tests__/urlState.test.ts`: 10 tests — round-trip (4), produces valid base64, malformed inputs (3), boundary (2)
- `hooks/useHistory.ts`: replaced `useEffect` + `setHistory` with lazy `useState` initializer per code-standards pattern; removes the post-mount history flash in the count badge
- `components/MoodInput.tsx`: replaced `useEffect` localStorage read + `setModel` with lazy `useState` initializer; removed `useEffect` import
- Total: **69 tests, 5 files, all passing**

---

### Section 09 — Vercel deployment (feat/vercel-deployment)

- `apps/root/vercel.json`: framework `nextjs`, buildCommand `cd ../.. && pnpm build --filter=@studio/root`, installCommand `cd ../.. && pnpm install --frozen-lockfile`, outputDirectory `.next`
- `apps/palette-ai/vercel.json`: same pattern with `--filter=@studio/palette-ai`
- Both files version-control the monorepo build overrides; Vercel dashboard Root Directory must be set to the respective `apps/<name>` folder per project
- `packages/ai-core/src/rateLimiter.ts` corrected to in-memory Map (removed `@vercel/kv` — Phase 2 decision per architecture-context.md)
- `@vercel/kv` removed from `packages/ai-core/package.json` and `apps/palette-ai/package.json`
- Env vars for `apps/palette-ai`: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
- Env vars for `apps/root`: none

---

### Section 10a — Shareable URL (feat/palette-ai-shareable-url)

- `apps/palette-ai/components/ShareToast.tsx`: fixed bottom-center toast, slide-up CSS transition, `aria-live="polite"`, auto-hides after 2s
- `apps/palette-ai/app/page.tsx`:
  - Mount `useEffect` decodes URL hash with `decodeState<Palette>` and restores `activePalette` + `lastCount` without an API call
  - Palette generation `useEffect` calls `encodeState(full)` and writes to `window.location.hash` after `addToHistory`
  - `handleShare` writes `window.location.href` to clipboard and triggers the toast
  - Share button (Share2 icon + "Share" label) added to AppShell `actions` slot alongside existing history button
- `encodeState` / `decodeState` from `@studio/utils` — no new utility code needed
- Build: `pnpm build --filter=@studio/palette-ai` passes with zero TypeScript errors

---

### Section 10b — Image upload (feat/palette-ai-image-upload)

- `packages/ai-core/src/types.ts`: added `ImageMimeType` and `VisionProviderFn` types alongside existing `ProviderFn`
- `packages/ai-core/src/claudeVisionProvider.ts`: vision provider using Anthropic SDK `messages.create` with image content block
- `packages/ai-core/src/geminiVisionProvider.ts`: vision provider using Google GenAI `generateContent` with `inlineData` block
- `packages/ai-core/src/index.ts`: exports both vision providers and new types
- `apps/palette-ai/app/api/generate-from-image/route.ts`: POST route — rate limit → validate (type, size, count, model) → Strategy-routes to vision provider → `parseColours` with one retry on `PARSE_FAILED`; 15s AbortController timeout
- `apps/palette-ai/hooks/usePalette.ts`: added `generateFromImage(file, count, model)` alongside existing `generate`; reads file as base64, posts to `/api/generate-from-image`, saves palette with `mood: "from image"`
- `apps/palette-ai/components/MoodInput.tsx`: "Use image" button (ImageIcon) triggers hidden `<input type="file">`; thumbnail with spinner overlay shows while `isLoading`; disappears on completion; `onGenerateFromImage` callback passes model as third arg
- File guards: JPEG/PNG/WEBP only, max 5 MB — validated in component and in the API route
- Count selector and ModelToggle both apply to image-derived palettes; history badge reflects correct provider

---

### Hisaab H01 — Scaffold (feat/hisaab-scaffold)

- `apps/hisaab/package.json`: `@studio/hisaab`, port 3002, idb ^8, recharts ^2.12, `@studio/ai-core` workspace dep for API routes
- `apps/hisaab/next.config.ts`: transpilePackages for all four `@studio/*` packages
- `apps/hisaab/tailwind.config.ts`: extends base config, content globs cover app/components/hooks/lib + shared UI package
- `apps/hisaab/tsconfig.json`: extends `tsconfig.base.json`, `@/*` path alias
- `apps/hisaab/postcss.config.mjs`: tailwindcss + autoprefixer
- `apps/hisaab/vercel.json`: monorepo build pattern, `--filter=@studio/hisaab`
- `apps/hisaab/app/globals.css`: Tailwind directives
- `apps/hisaab/app/layout.tsx`: Inter font, `className="dark"` on `<html>`, metadata
- `apps/hisaab/app/page.tsx`: client component — `h-dvh` flex layout, fixed top header (app name + currency chip), three tab panels (all mounted, inactive `hidden`), fixed bottom tab bar with ARIA roles
- `apps/hisaab/components/ChatTab.tsx`: stub — "coming in Section 03"
- `apps/hisaab/components/SummaryTab.tsx`: stub — "coming in Section 04"
- `apps/hisaab/components/HistoryTab.tsx`: stub — "coming in Section 05"
- `apps/hisaab/components/CurrencyPickerModal.tsx`: stub — defaults to INR, will be replaced in H02
- `apps/hisaab/hooks/useCurrency.ts`: lazy `useState` reads `studio:budget-currency`; `isPickerOpen` true on first visit; exposes `openPicker`, `closePicker`, `saveCurrency`
- `apps/hisaab/lib/types.ts`: `AIModel`, `Category`, `Currency`, `Expense` (with `model: AIModel`), `ParsedExpense`
- `apps/hisaab/lib/categories.ts`: `CATEGORY_META` record (colour, Icon, chartColour hex), `ALL_CATEGORIES` array

### Hisaab H02 — Currency picker (feat/hisaab-currency-picker)

- `apps/hisaab/lib/currencies.ts`: `CURRENCIES` array (25 entries), `LOCALE_TO_CURRENCY` map, `detectCurrency()` reads `navigator.language` and maps region subtag to currency code, falls back to USD
- `apps/hisaab/hooks/useCurrency.ts`: `useEffect`-based initialisation (instead of lazy `useState`) to avoid SSR hydration mismatch on return visits; `useCallback` on all returned functions
- `apps/hisaab/components/CurrencyPickerModal.tsx`: bottom sheet on mobile / centred card on sm+; search input filters by name or code; radio-style list with detected currency pre-selected and scrolled into view; `isDismissible` prop gates X button, backdrop click, and Escape key; confirm button calls `onSelect`; `role="dialog"`, `aria-modal`, `aria-labelledby`, `role="radiogroup"` on list
- `apps/hisaab/app/page.tsx`: passes `isDismissible={currency !== null}` to modal

**Deviation from spec:** `useCurrency` uses `useEffect` for localStorage reads instead of the spec's lazy `useState` initializer — required to prevent React hydration mismatch on return visits (proven in H01).

---

### Hisaab H03 — Chat tab (feat/hisaab-chat-tab)

- `apps/hisaab/lib/db.ts`: `openDB` wrapper — `getDB()` singleton, `addExpense` (put), `deleteExpense`, `getAllExpenses` (sorted by `createdAt` desc)
- `apps/hisaab/lib/buildExpensePrompt.ts`: injects today's date + currency code + category list; date inference rules for "yesterday" and day names
- `apps/hisaab/lib/parseExpense.ts`: strips markdown fences, JSON.parse, validates shape, normalises invalid category to "Others", validates date format
- `apps/hisaab/lib/providers/index.ts`: `generateParsedExpense()` strategy router; routes to `claudeProvider` or `geminiProvider`; one retry with stricter prompt suffix on `PARSE_FAILED`
- `apps/hisaab/app/api/parse-expense/route.ts`: rate limit → validate body → `generateParsedExpense` → reject amount ≤ 0 → return `ParsedExpense`; 15s AbortController timeout
- `apps/hisaab/hooks/useExpenses.ts`: loads all expenses from IndexedDB on mount; `add` and `remove` update IndexedDB + React state atomically
- `apps/hisaab/hooks/useChatModel.ts`: `useEffect`-based localStorage read for hydration safety; `setModel` writes to `studio:preferred-model`
- `apps/hisaab/components/UserMessageBubble.tsx`: right-aligned violet bubble, `rounded-tr-sm`, max-w-75%
- `apps/hisaab/components/ExpenseBubble.tsx`: left-aligned white/dark bubble with category icon + colour; inline delete confirmation (no modal); fade+scale animation on delete; date formatted as Today / Yesterday / DD MMM
- `apps/hisaab/components/ChatTab.tsx`: ModelToggle sub-header; scrollable bubble area; empty state with example hints; loading dots bubble; sticky input bar (Enter to send, Shift+Enter for newline); error shown above input, clears on next keystroke; `useEffect` restores expenses from IndexedDB into messages on mount; `model` included on `Expense` object

**User-specified completions applied:**

- `useEffect` that initialises messages from persisted expenses
- `model` field on `Expense` object in `handleSend`

**Deviation from spec:** `useChatModel` uses `useEffect` instead of lazy `useState` initializer — consistent with H01/H02 hydration fix pattern.

---

### Hisaab H04 — Summary tab (feat/hisaab-summary-tab)

- `apps/hisaab/lib/types.ts`: added `ChartEntry` interface (`{ name: Category; value: number }`)
- `apps/hisaab/lib/buildInsightPrompt.ts`: builds prompt with period label, total, category breakdown sorted by amount, transaction count; one-sentence 20-word max instruction
- `apps/hisaab/lib/parseInsight.ts`: strips markdown chars, trims raw AI response
- `apps/hisaab/app/api/summary-insight/route.ts`: POST — rate limit → validate (expenses array, period, currency) → Gemini only → `buildInsightPrompt` → `parseInsight` → `{ insight }`; max 200 expenses server-side
- `apps/hisaab/components/DonutChart.tsx`: Recharts `PieChart + Pie + Cell`; absolute-positioned centre label with total + "total"; empty state renders CSS ring div (no PieChart with empty data); `role="img"` with descriptive `aria-label`
- `apps/hisaab/components/CategoryBreakdown.tsx`: sorted by amount desc; icon + name + amount + percentage per row; progress bar via inline `style={{ width, background }}` using `chartColour` from `CATEGORY_META`; `role="list/listitem/progressbar"` with ARIA attrs
- `apps/hisaab/components/InsightCard.tsx`: `aria-live="polite"`; Skeleton while loading; static prompt when no expenses; insight text or fallback
- `apps/hisaab/components/SummaryTab.tsx`: period toggle (Weekly/Monthly, `role="radiogroup"`); `useMemo` for `filteredExpenses` and `chartData/total`; insight `useEffect` with 500ms debounce via `useRef`; passes `expenses` + `currency` to child components
- `apps/hisaab/app/page.tsx`: lifted `useExpenses` from `ChatTab` to page level; passes `expenses`, `expensesLoading`, `onAdd`, `onRemove` to `ChatTab`; passes `expenses` to `SummaryTab`; passes `expenses`, `onRemove` to `HistoryTab`
- `apps/hisaab/components/ChatTab.tsx`: removed internal `useExpenses()` call; accepts `expenses`, `expensesLoading`, `onAdd`, `onRemove` as props
- `apps/hisaab/components/HistoryTab.tsx`: stub updated with correct props for H05 (`currency`, `expenses`, `onRemove`)

**Architecture note:** `useExpenses` lifted to `page.tsx` (not in spec) to enable cross-tab reactivity — when ChatTab adds an expense, SummaryTab updates immediately without re-reading IndexedDB.

---

### Hisaab H05 — History tab + CSV export (feat/hisaab-history-tab)

- `apps/hisaab/lib/exportCsv.ts`: `exportToCSV(expenses, currency)` — RFC 4180 CSV, description double-quote escaped, Blob + `URL.createObjectURL` download, filename `hisaab-export-YYYY-MM-DD.csv`
- `apps/hisaab/lib/groupByDate.ts`: `groupByDate(expenses)` — groups into `ExpenseGroup[]` sorted date-desc; "Today"/"Yesterday"/`"D MMM YYYY"` labels; items sorted by `createdAt` desc within each group
- `apps/hisaab/components/DateGroupHeader.tsx`: label + horizontal rule divider
- `apps/hisaab/components/CategoryFilterChips.tsx`: horizontally scrollable multi-select chips; `Set<Category>` toggle; `role="group"`, each chip `role="checkbox"` + `aria-checked`
- `apps/hisaab/components/ExpenseRow.tsx`: icon + description + amount + trash; inline delete confirmation with fade animation; `aria-live="polite"` on confirm region
- `apps/hisaab/components/HistoryTab.tsx`: search (clear X button), category chips, From/To date inputs with invalid-range error, count + export row; `filteredExpenses` via `useMemo`; two empty states (no expenses / no matches + clear filters); grouped list with `role="list"`; export button label shows filtered count when filters active

---

## Open Questions

- [ ] Confirm final domain name for yourdomain.dev

---

## Decisions Made

| Decision                                     | Rationale                                                                                         | Date         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| Use pnpm + Turborepo                         | Industry standard monorepo tooling, fast installs                                                 | Setup        |
| Default AI provider: Gemini                  | Free tier 1500 req/day, preserves Claude credits                                                  | Setup        |
| Claude model: claude-haiku-4-5-20251001      | Cheapest Claude, fast, sufficient for JSON generation                                             | Setup        |
| Rate limiter: in-memory Map only for Phase 1 | Skip Upstash — Anthropic hard cap is the real safety net. Upgrade in Phase 2.                     | Setup        |
| Mobile 5 colours: banner + labels            | Discussed and confirmed by user                                                                   | Planning     |
| Mobile 8 colours: banner + scroll            | Discussed and confirmed by user                                                                   | Planning     |
| Strategy pattern for AI providers            | Extensible — adding OpenAI = 1 file + 1 line                                                      | Planning     |
| No auth/DB in Phase 1 and 2                  | Portfolio tool, localStorage sufficient                                                           | Planning     |
| Hisaab rate limiter                          | Reuse `@studio/ai-core` `checkRateLimit` — apps are separate Vercel deployments, already isolated | Hisaab build |

---

## Next Steps

1. Build Skrawl (apps/skrawl) — TensorFlow.js drawing recognition game
2. Polish root site — proper hero header, studio description, footer with name/links
3. MockMate — AI mock interview (after Skrawl)

---

## Known Issues

None.
