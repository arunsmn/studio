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
| 04 — Shared UI components | feat/shared-ui-components | ✅ Complete | PR pending → develop |
| 05 — PaletteAI API layer | feat/palette-ai-api | ⬜ Not started | |
| 06 — PaletteAI input + swatches | feat/palette-ai-ui-input-swatches | ⬜ Not started | |
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

---

## In Progress

_Section 05 — PaletteAI API layer (up next)_

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

1. Merge feat/root-site → develop on GitHub
2. Run `git checkout develop && git pull origin develop`
3. Run Section 04: shared UI components

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
