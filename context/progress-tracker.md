# Progress Tracker

> Update this file after every meaningful implementation change.
> This is the file Claude reads to understand where we left off.

---

## Current Phase

**Phase 1 — PaletteAI build** (in progress — Section 07 next)

---

## Status by Section

| Section                                | Branch                              | Status         | Notes             |
| -------------------------------------- | ----------------------------------- | -------------- | ----------------- |
| 01 — Monorepo scaffold                 | feat/monorepo-scaffold              | ✅ Complete    | Merged to develop |
| 02 — Shared packages                   | feat/shared-packages                | ✅ Complete    | Merged to develop |
| 03 — Root site                         | feat/root-site                      | ✅ Complete    | Merged to develop |
| 04 — Shared UI components              | feat/shared-ui-components           | ✅ Complete    | Merged to develop |
| 05 — PaletteAI API layer               | feat/palette-ai-api                 | ✅ Complete    | Merged to develop |
| 06 — PaletteAI input + swatches        | feat/palette-ai-ui-input-swatches   | ✅ Complete    | Merged to develop |
| 07 — PaletteAI page + preview + export | feat/palette-ai-page-preview-export | 🔄 In progress |                   |
| 08 — Tests + polish                    | feat/palette-ai-tests-polish        | ⬜ Not started |                   |
| 09 — Vercel deployment                 | —                                   | ⬜ Not started |                   |
| 10 — Phase 2 features                  | feat/palette-ai-\*                  | ⬜ Not started | Post-launch       |

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

---

## In Progress

### Section 07 — PaletteAI page + preview + export (feat/palette-ai-page-preview-export)

- Branch created: `feat/palette-ai-page-preview-export`
- Files to create: LivePreview.tsx, ExportPanel.tsx, HistoryDrawer.tsx, app/page.tsx, app/globals.css

---

## Open Questions

- [ ] Confirm final domain name for yourdomain.dev
- [ ] Decide: deploy root and palette-ai to same Vercel team or separate?

---

## Decisions Made

| Decision                                     | Rationale                                                                     | Date     |
| -------------------------------------------- | ----------------------------------------------------------------------------- | -------- |
| Use pnpm + Turborepo                         | Industry standard monorepo tooling, fast installs                             | Setup    |
| Default AI provider: Gemini                  | Free tier 1500 req/day, preserves Claude credits                              | Setup    |
| Claude model: claude-haiku-4-5-20251001      | Cheapest Claude, fast, sufficient for JSON generation                         | Setup    |
| Rate limiter: in-memory Map only for Phase 1 | Skip Upstash — Anthropic hard cap is the real safety net. Upgrade in Phase 2. | Setup    |
| Mobile 5 colours: banner + labels            | Discussed and confirmed by user                                               | Planning |
| Mobile 8 colours: banner + scroll            | Discussed and confirmed by user                                               | Planning |
| Strategy pattern for AI providers            | Extensible — adding OpenAI = 1 file + 1 line                                  | Planning |
| No auth/DB in Phase 1 and 2                  | Portfolio tool, localStorage sufficient                                       | Planning |

---

## Next Steps

1. Execute Section 07 — LivePreview, ExportPanel, HistoryDrawer, main page
2. Checkpoint: full flow works end to end
3. Commit and merge feat/palette-ai-page-preview-export → develop
4. Move to Section 08 — tests + polish

---

## Known Issues

None.
