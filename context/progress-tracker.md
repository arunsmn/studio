# Progress Tracker

> Update this file after every meaningful implementation change.
> This is the file Claude reads to understand where we left off.

---

## Current Phase

**Phase 0 — Setup** (in progress)

---

## Status by Section

| Section | Branch | Status | Notes |
|---------|--------|--------|-------|
| 01 — Monorepo scaffold | feat/monorepo-scaffold | ✅ Complete | Merged to develop |
| 02 — Shared packages | feat/shared-packages | ✅ Complete | Merged to develop |
| 03 — Root site | feat/root-site | ✅ Complete | Merged to develop |
| 04 — Shared UI components | feat/shared-ui-components | ✅ Complete | Merged to develop |
| 05 — PaletteAI API layer | feat/palette-ai-api | ✅ Complete | PR pending → develop |
| 06 — PaletteAI input + swatches | feat/palette-ai-ui-input-swatches | ✅ Complete | PR pending → develop |
| 07 — PaletteAI page + preview + export | feat/palette-ai-page-preview-export | ⬜ Not started | |
| 08 — Tests + polish | feat/palette-ai-tests-polish | ⬜ Not started | |
| 09 — Vercel deployment | — | ⬜ Not started | |
| 10 — Phase 2 features | feat/palette-ai-* | ⬜ Not started | Post-launch |

Status key: ⬜ Not started · 🔄 In progress · ✅ Complete · ❌ Blocked

---

## Completed Work

### Section 01 — Monorepo scaffold (feat/monorepo-scaffold)
- Created `package.json` (root) with pnpm workspaces, turbo scripts, devDeps
- Created `pnpm-workspace.yaml` with apps/* and packages/* globs
- Created `turbo.json` (v2) with build/dev/lint/test tasks + globalEnv passthrough
- Created `tsconfig.base.json` with strict: true, ES2022, moduleResolution: bundler
- Updated `.gitignore` to cover node_modules, .next, dist, .turbo, .env*.local, *.tsbuildinfo
- Created `.env.example` with all four required env var keys

### Section 02 — Shared packages (feat/shared-packages)
- `packages/tailwind-config`: package.json + tailwind.config.base.ts (darkMode, Inter font, pulse-slow animation, screens)
- `packages/utils`: cn(), hexToRgb, hexToHSL, getContrastRatio, getTextColour, isWCAGAA, isWCAGAAA, encodeState, decodeState
- `packages/ui`: scaffold only — package.json, tsconfig, empty index (components added in Section 04)
- `packages/ai-core`: AIModel/ProviderFn/RateLimitResult types, claudeProvider (claude-haiku-4-5-20251001), geminiProvider (gemini-2.0-flash), checkRateLimit (Vercel KV, 10s cooldown, 100/day cap)

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
- `apps/palette-ai/`: package.json (nanoid, vitest, @vitejs/plugin-react), next.config.ts, tailwind.config.ts, postcss.config.mjs, tsconfig.json, vitest.config.ts
- `app/layout.tsx`: Inter font, dark mode, metadata
- `app/globals.css`: Tailwind directives
- `app/page.tsx`: minimal placeholder (full UI in Sections 06–07)
- `lib/types.ts`: Colour, PaletteOptions, Palette interfaces
- `lib/buildPrompt.ts`: structured prompt with exact count, mood, tone, useCase, audience, theme
- `lib/parseColours.ts`: fence stripping, array extraction, hex/usage validation, PARSE_FAILED on failure
- `lib/providers/types.ts`: re-exports AIModel, ProviderFn from @studio/ai-core
- `lib/providers/index.ts`: generatePalette() — routes to claude/gemini, retries once on PARSE_FAILED
- `app/api/generate/route.ts`: POST — rate limit, full validation (all 6 fields), 15s AbortController timeout, typed error responses

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

### Section 06 — PaletteAI input + swatches (feat/palette-ai-ui-input-swatches)
- `hooks/usePalette.ts`: state (palette, isLoading, error, cooldown), fetch /api/generate, 10s countdown, AbortController 15s timeout
- `hooks/useHistory.ts`: Palette[] in localStorage "studio:palette-history", max 20, newest-first, SSR-guarded
- `components/MoodInput.tsx`: textarea + char counter, example mood chips, tone/useCase/audience/theme/count PillChip groups, ModelToggle, Generate button with cooldown countdown
- `components/BannerStrip.tsx`: full-width flex segments, hover flex:2 transition, selected inset outline, 44px mobile / 56px desktop
- `components/SwatchCard.tsx`: 80px colour block with usage label overlay (getTextColour), name/hex/CopyButton below, selected violet border
- `components/LabelList.tsx`: mobile 5-colour layout, colour dot + name + hex + WCAG AA badge + CopyButton per row
- `components/ScrollCards.tsx`: horizontal scroll-snap row, 110px cards, 56px colour block, name + hex
- `components/DetailPanel.tsx`: animated max-height expand/collapse, swatch preview, hex/HSL/contrast/usage/rationale, WCAG AA+AAA badges, CopyButton
- `components/SwatchGrid.tsx`: responsive — desktop flex SwatchCards, mobile 5→LabelList / 8→ScrollCards, inline useIsMobile hook, DetailPanel below
- `components/SkeletonGrid.tsx`: count Skeleton placeholders in desktop (flex row) and mobile (stacked list) layouts

---

## In Progress

_Section 07 — PaletteAI page + preview + export (up next)_

---

## Open Questions

- [ ] Confirm final domain name for yourdomain.dev
- [ ] Confirm Vercel KV region preference
- [ ] Decide: deploy root and palette-ai to same Vercel team or separate?

---

## Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| Use pnpm + Turborepo | Industry standard monorepo tooling, fast installs | Setup |
| Default AI provider: Gemini | Free tier 1500 req/day, preserves Claude credits | Setup |
| Claude model: claude-haiku-4-5-20251001 | Cheapest Claude, fast, sufficient for JSON generation | Setup |
| Rate limiter: Vercel KV | In-memory resets on cold starts — KV is persistent | Setup |
| Mobile 5 colours: banner + labels | Discussed and confirmed by user | Planning |
| Mobile 8 colours: banner + scroll | Discussed and confirmed by user | Planning |
| Strategy pattern for AI providers | Extensible — adding OpenAI = 1 file + 1 line | Planning |
| No auth/DB in Phase 1 and 2 | Portfolio tool, localStorage sufficient | Planning |

---

## Files Created So Far

See Completed Work section above for a per-section breakdown.

---

## Next Steps

1. Open PR: feat/palette-ai-ui-input-swatches → develop on GitHub
2. Merge feat/palette-ai-api → develop first (Section 05 dependency)
3. Run Section 07: PaletteAI page + live preview + export

---

## Known Issues

_None yet._

---

## How to Update This File

After completing a section, update:
1. The status table — change ⬜ to ✅
2. Move the section's work to "Completed Work"
3. Update "Next Steps" to the following section
4. Add any decisions made during implementation to the decisions table
5. Add any new open questions that came up

Example completed entry:
```
## Completed Work

### Section 01 — Monorepo scaffold (feat/monorepo-scaffold)
- Created package.json (root) with pnpm workspaces
- Created pnpm-workspace.yaml
- Created turbo.json with build/dev/lint/test pipeline
- Created tsconfig.base.json with strict: true
- Created .gitignore and .env.example
- PR merged to develop
```
