# Architecture Context

## Monorepo Structure

```
studio/                          ← repo root
├── CLAUDE.md                    ← @AGENTS.md
├── AGENTS.md                    ← this orchestration file
├── context/                     ← all context files live here
├── package.json                 ← pnpm workspaces root
├── pnpm-workspace.yaml          ← workspaces: ["apps/*", "packages/*"]
├── turbo.json                   ← Turborepo pipeline
├── tsconfig.base.json           ← base TS config all apps extend
├── .env.local                   ← ANTHROPIC_API_KEY, GEMINI_API_KEY, KV_*
│
├── apps/
│   ├── root/                    ← @studio/root — showcase landing site
│   └── palette-ai/              ← @studio/palette-ai — PaletteAI app
│
└── packages/
    ├── ui/                      ← @studio/ui — shared React components
    ├── ai-core/                 ← @studio/ai-core — AI providers + rate limiter
    ├── utils/                   ← @studio/utils — pure utility functions
    └── tailwind-config/         ← @studio/tailwind-config — base Tailwind config
```

## Package Responsibilities

### `@studio/ui` (packages/ui)

- Shared React components only
- All components have `"use client"` directive
- Components: Button, PillChip, CopyButton, ModelToggle, Skeleton,
  ErrorState, AppShell
- Zero business logic — display and interaction only
- Peer deps: react, next

### `@studio/ai-core` (packages/ai-core)

- Server-side only — never imported in client components
- Contains: claudeProvider, geminiProvider, rateLimiter, shared types
- Models: claude-haiku-4-5-20251001 (Anthropic), gemini-2.0-flash (Google)
- Rate limiter uses Vercel KV (persistent across serverless cold starts)
- Strategy pattern: ProviderFn = (prompt: string) => Promise<string>

### `@studio/utils` (packages/utils)

- Pure functions — no React, no Node-only APIs
- Safe to import in both client and server components
- Contains: cn(), colourUtils, urlState (btoa/atob)

### `@studio/tailwind-config` (packages/tailwind-config)

- Base Tailwind config all apps extend
- Defines: fonts, breakpoints, animation tokens, darkMode strategy

## App Structure (per app)

Each Next.js app in `apps/` follows this layout:

```
apps/[app-name]/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/[route]/route.ts     ← server-side API routes only
├── components/                  ← app-specific components
├── hooks/                       ← app-specific custom hooks
├── lib/
│   ├── types.ts                 ← app-specific types
│   ├── buildPrompt.ts           ← prompt construction (palette-ai)
│   ├── parseColours.ts          ← response parsing (palette-ai)
│   └── providers/               ← strategy router (palette-ai)
│       ├── index.ts             ← generatePalette() — the router
│       ├── claudeProvider.ts    ← re-exports from @studio/ai-core
│       ├── geminiProvider.ts    ← re-exports from @studio/ai-core
│       └── types.ts             ← re-exports AIModel, ProviderFn
└── __tests__/                   ← Vitest unit tests
```

## Architectural Invariants — Never Violate These

1. **API keys never reach the browser.** All AI SDK imports live in
   `app/api/*/route.ts` files or `@studio/ai-core`. If an AI import
   appears in a component or hook, it is wrong.

2. **`@studio/ai-core` is server-side only.** It is never imported
   in components, hooks, or any file that might run on the client.

3. **Shared logic lives in packages, not in apps.** If two apps would
   share a function, it belongs in a package. No copy-paste between apps.

4. **Each app is independently deployable.** No app imports from
   another app. Only cross-cutting packages are shared.

5. **In-memory state does not work on Vercel.** Module-level variables
   reset on cold starts. Use Vercel KV for any state that must persist
   across requests (rate limiting, counters).

6. **buildPrompt and parseColours are app-specific.** They are not
   shared packages because each app has different AI output schemas.

## AI Provider Strategy Pattern

```
route.ts
  └── generatePalette(options)          ← strategy router (lib/providers/index.ts)
        ├── buildPrompt(options)         ← shared prompt builder
        ├── claudeProvider(prompt)       ← concrete strategy A
        │     └── @anthropic-ai/sdk
        ├── geminiProvider(prompt)       ← concrete strategy B
        │     └── @google/generative-ai
        └── parseColours(raw, count)     ← shared output parser
```

Adding a new AI provider = one new file + one branch in the router.
Nothing else changes.

## Rate Limiting Architecture (3 layers)

Layer 1 — Anthropic dashboard: $5 hard monthly spend cap (zero code)
Layer 2 — In-memory module Map: per-IP 10s cooldown + 100/day global cap
NOTE: resets on Vercel cold starts — acceptable for Phase 1
Upgrade to Upstash Redis in Phase 2
Layer 3 — Client: 10-second countdown button (UX signal, not security)

## URL State (Shareable Palettes)

Palette state is encoded as base64 JSON in the URL hash.
No database, no server, no auth. Fully stateless.
Implemented in `@studio/utils/urlState.ts`.

## localStorage Keys (Palette History)

Key: `studio:palette-history` — array of Palette objects, max 20, newest first
Key: `studio:preferred-model` — "claude" | "gemini", set by ModelToggle

## Port Assignments

- apps/root: port 3000
- apps/palette-ai: port 3001
- Future apps: 3002, 3003...

## Deployment

- Platform: Vercel (free tier)
- Each app is a separate Vercel project
- Build command pattern: `cd ../.. && pnpm build --filter=@studio/[app-name]`
- Environment variables set per-project in Vercel dashboard
