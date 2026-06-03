# Progress Tracker

> Update this file after every meaningful implementation change.
> This is the file Claude reads to understand where we left off.

---

## Current Phase

**Phase 0 — Setup** (not started)

---

## Status by Section

| Section | Branch | Status | Notes |
|---------|--------|--------|-------|
| 01 — Monorepo scaffold | feat/monorepo-scaffold | ⬜ Not started | |
| 02 — Shared packages | feat/shared-packages | ⬜ Not started | |
| 03 — Root site | feat/root-site | ⬜ Not started | |
| 04 — Shared UI components | feat/shared-ui-components | ⬜ Not started | |
| 05 — PaletteAI API layer | feat/palette-ai-api | ⬜ Not started | |
| 06 — PaletteAI input + swatches | feat/palette-ai-ui-input-swatches | ⬜ Not started | |
| 07 — PaletteAI page + preview + export | feat/palette-ai-page-preview-export | ⬜ Not started | |
| 08 — Tests + polish | feat/palette-ai-tests-polish | ⬜ Not started | |
| 09 — Vercel deployment | — | ⬜ Not started | |
| 10 — Phase 2 features | feat/palette-ai-* | ⬜ Not started | Post-launch |

Status key: ⬜ Not started · 🔄 In progress · ✅ Complete · ❌ Blocked

---

## Completed Work

_Nothing completed yet._

---

## In Progress

_Nothing in progress yet._

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

_None — project not initialised yet._

---

## Next Steps

1. Initialise GitHub repo
2. Run Section 01: monorepo scaffold
3. Run Section 02: shared packages
4. Continue in order per the spec file

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
