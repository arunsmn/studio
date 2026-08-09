# Studio

> A monorepo of AI-powered apps, tools and games — built to demonstrate
> real-world AI integration, TypeScript architecture and product thinking.

🏠 **Studio:** [studio-root.vercel.app](https://studio-root.vercel.app)

---

## Live Apps

| App                                               | Category | Status         | Description                                                     |
| ------------------------------------------------- | -------- | -------------- | --------------------------------------------------------------- |
| [PaletteAI](https://studio-palette-ai.vercel.app) | Tool     | ✅ Live        | Describe a mood or upload a photo — get a design colour palette |
| [Hisaab](https://studio-hisaab.vercel.app)        | App      | ✅ Live        | Just say what you spent — AI tracks your expenses               |
| MockMate                                          | App      | 🔜 Coming soon | AI mock interview with live scoring                             |

---

## Monorepo Structure

## Monorepo Structure

```text
studio/
├── apps/
│   ├── palette-ai/       — colour palette generator
│   ├── hisaab/           — expense tracker
│   └── root/             — studio showcase landing site
└── packages/
    ├── ui/               — shared React components
    ├── ai-core/          — AI providers + rate limiter
    ├── utils/            — pure utility functions
    └── tailwind-config/  — base Tailwind config
```

Each app is independently deployable. No app imports from another app —
only shared packages are cross-cutting.

---

## Shared Packages

| Package                   | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `@studio/ui`              | Shared React components — Button, PillChip, ModelToggle, Skeleton etc. |
| `@studio/ai-core`         | Claude and Gemini providers, rate limiter — server-side only           |
| `@studio/utils`           | Pure utilities — colour math, URL state encoding, cn()                 |
| `@studio/tailwind-config` | Base Tailwind config extended by every app                             |

---

## Tech Stack

| Layer       | Choice                                        |
| ----------- | --------------------------------------------- |
| Framework   | Next.js 14 (App Router)                       |
| Language    | TypeScript — strict: true throughout          |
| Styling     | Tailwind CSS                                  |
| AI — Claude | Anthropic claude-haiku-4-5-20251001           |
| AI — Gemini | Google gemini-2.5-flash (default — free tier) |
| Monorepo    | pnpm workspaces + Turborepo                   |
| Deployment  | Vercel — one project per app                  |
| Testing     | Vitest                                        |

---

## Key Architecture Decisions

**Strategy pattern for AI providers**
Every app routes AI calls through a provider interface —
`claudeProvider` and `geminiProvider` share an identical
function signature. Adding a third provider is one file
and one line in the router. Nothing else changes.

**API key isolation**
AI SDKs are imported exclusively inside `packages/ai-core`
and `app/api/*/route.ts` files. They never reach the browser.

**No database — localStorage and URL state**
Palette history and expense data live in the browser.
Shareable URLs encode state as base64 in the URL hash —
no backend round-trip, no auth, fully stateless.

**Shared packages, independent apps**
Logic shared between apps lives in packages, never
copy-pasted between apps. Each app is independently
deployable and has its own Vercel project.

---

## Local Development

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
# Clone and install
git clone https://github.com/arunsmn/studio.git
cd studio
pnpm install

# Add API keys
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY and GEMINI_API_KEY

# Run a specific app
pnpm dev --filter=@studio/palette-ai   # → localhost:3001
pnpm dev --filter=@studio/hisaab       # → localhost:3002

# Run all apps
pnpm dev

# Run tests
pnpm test --filter=@studio/palette-ai

# Build check before deploying
pnpm build --filter=@studio/palette-ai
```

---

## Deployment

Each app is a separate Vercel project. Build command pattern:

```bash
cd ../.. && pnpm build --filter=@studio/[app-name]
```

Environment variables required for `palette-ai` and `hisaab`:

- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

`apps/root` requires no environment variables.

---

## Adding a New App

1. Create `apps/[name]/` following the same structure
2. Add `@studio/ui`, `@studio/ai-core`, `@studio/utils` as dependencies
3. Add a card to `apps/root/data/apps.ts`
4. Deploy as a new Vercel project

The shared packages are available immediately — no extra setup.
