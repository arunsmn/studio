# PaletteAI — spec-driven build file
# Studio monorepo + PaletteAI app

> Feed each SECTION to Claude separately in order.
> Do not skip sections. Each section depends on the previous one.
> Copy the section header + body as your prompt each time.

---

## HOW TO USE THIS FILE

1. Open a new Claude conversation
2. Start with the CONTEXT BLOCK below — paste it at the start of every new session
3. Then paste SECTION 01, let Claude execute it fully
4. Continue with SECTION 02, 03... in order
5. Each section ends with a CHECKPOINT — verify before moving on

---

## CONTEXT BLOCK
> Paste this at the start of every new Claude session before any section

```
You are helping me build a monorepo called "studio" using pnpm workspaces
and Turborepo. It contains a root showcase site and individual Next.js apps.
The first app is PaletteAI — a mood-to-colour-palette generator using
Claude and Gemini via the Strategy pattern.

Tech stack:
- pnpm workspaces + Turborepo
- Next.js 14 (app router) + TypeScript + Tailwind CSS
- @anthropic-ai/sdk (claude-haiku-4-5-20251001)
- @google/generative-ai (gemini-2.0-flash)
- Vercel KV for rate limiting
- Vitest for unit tests
- lucide-react for icons
- clsx + tailwind-merge

Monorepo package names:
- @studio/root      → apps/root
- @studio/palette-ai → apps/palette-ai
- @studio/ui        → packages/ui
- @studio/ai-core   → packages/ai-core
- @studio/utils     → packages/utils
- @studio/tailwind-config → packages/tailwind-config

Always generate complete, production-ready file contents.
Never use placeholder comments like "// add logic here".
Always use TypeScript. Never use `any`.
```

---

## SECTION 01 — GitHub repo + monorepo scaffold

> GOAL: Create the GitHub repo, set up branches, scaffold the root
> monorepo config files. No app code yet.

### GitHub commands — run these locally first

```bash
# 1. Create repo on GitHub (do this in the browser or via CLI)
gh repo create studio --public --description "AI-powered mini product studio"

# 2. Clone and enter
git clone https://github.com/YOUR_USERNAME/studio.git
cd studio

# 3. Set up branch strategy
git checkout -b main
git push -u origin main

# 4. Create develop branch — all feature work branches from here
git checkout -b develop
git push -u origin develop

# 5. Create the first feature branch for monorepo scaffold
git checkout -b feat/monorepo-scaffold
```

### Branch strategy

```
main          ← production, deploys to Vercel automatically
develop       ← integration branch, all features merge here first
feat/*        ← one branch per feature or section of this spec
fix/*         ← bug fixes
```

### Prompt for Claude

```
Generate the following files with complete contents for a pnpm + Turborepo
monorepo called "studio". No app code yet — only root config files.

Files to generate:

1. package.json (root)
   - name: "studio"
   - private: true
   - packageManager: "pnpm@9.0.0"
   - workspaces: ["apps/*", "packages/*"]
   - scripts: dev, build, lint, test (all via turbo)
   - devDependencies: turbo, typescript, @types/node

2. pnpm-workspace.yaml
   - packages: ["apps/*", "packages/*"]

3. turbo.json
   - pipeline for build, dev, lint, test
   - build depends on upstream builds
   - dev is persistent
   - env passthrough: ANTHROPIC_API_KEY, GEMINI_API_KEY, KV_REST_API_URL,
     KV_REST_API_TOKEN

4. tsconfig.base.json
   - strict: true
   - target: ES2022
   - moduleResolution: bundler
   - jsx: preserve
   - paths: empty (each package extends and adds its own)

5. .gitignore
   - node_modules, .next, dist, .turbo, .env*.local, *.tsbuildinfo

6. .env.example
   - ANTHROPIC_API_KEY=
   - GEMINI_API_KEY=
   - KV_REST_API_URL=
   - KV_REST_API_TOKEN=

Generate each file with its full path relative to the repo root.
```

### Checkpoint 01

```bash
# After creating the files, run:
pnpm install          # should succeed with empty workspaces
git add .
git commit -m "feat: monorepo scaffold — pnpm workspaces + turbo"
git push origin feat/monorepo-scaffold
# Open a PR from feat/monorepo-scaffold → develop on GitHub
```

---

## SECTION 02 — Shared packages scaffold

> GOAL: Create the four shared packages with their package.json and
> index files. No component logic yet — just structure and types.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/shared-packages
```

### Prompt for Claude

```
Using the monorepo context above, generate the scaffold for four shared
packages. Each needs a package.json and a src/index.ts barrel export.
No implementation logic yet — just the package wiring.

1. packages/tailwind-config/
   - package.json: name "@studio/tailwind-config", main: tailwind.config.base.ts
   - tailwind.config.base.ts: exports a base config with:
     - fontFamily: sans using Inter
     - custom animation: "pulse-slow" (2s ease-in-out infinite)
     - screens: sm 640px, md 768px, lg 1024px, xl 1280px
     - darkMode: "class"

2. packages/utils/
   - package.json: name "@studio/utils", exports from src/index.ts
   - src/cn.ts: clsx + tailwind-merge helper, export function cn()
   - src/colourUtils.ts: export these functions with full implementations:
       hexToRgb(hex): [r, g, b]
       hexToHSL(hex): string "H S% L%"
       getContrastRatio(hex): number (WCAG formula)
       getTextColour(hex): "#ffffff" | "#1a1a1a"
       isWCAGAA(hex): boolean (ratio >= 4.5)
       isWCAGAAA(hex): boolean (ratio >= 7)
   - src/urlState.ts: export encodeState<T>(obj: T): string and
       decodeState<T>(str: string): T | null using btoa/atob + JSON
   - src/index.ts: barrel export of all above

3. packages/ui/
   - package.json: name "@studio/ui", peerDeps: react, next
   - src/index.ts: export placeholder (components added in Section 04)
   - Add "use client" directive placeholder note in index.ts

4. packages/ai-core/
   - package.json: name "@studio/ai-core", deps: @anthropic-ai/sdk,
     @google/generative-ai, @vercel/kv
   - src/types.ts: export these types:
       type AIModel = "claude" | "gemini"
       type ProviderFn = (prompt: string) => Promise<string>
       interface RateLimitResult { allowed: boolean; waitSeconds: number }
   - src/claudeProvider.ts: full implementation using @anthropic-ai/sdk,
       model: claude-haiku-4-5-20251001, max_tokens: 600
   - src/geminiProvider.ts: full implementation using @google/generative-ai,
       model: gemini-2.0-flash
   - src/rateLimiter.ts: full implementation using @vercel/kv
       - per-IP cooldown: 10 seconds
       - daily global cap: 100 calls (resets at midnight)
       - export checkRateLimit(ip: string): Promise<RateLimitResult>
   - src/index.ts: barrel export of all above

Generate every file with complete, working implementation code.
```

### Checkpoint 02

```bash
pnpm install          # packages should resolve each other
pnpm build            # should succeed (no app code yet)
git add .
git commit -m "feat: shared packages — ui, ai-core, utils, tailwind-config"
git push origin feat/shared-packages
# Open PR: feat/shared-packages → develop
```

---

## SECTION 03 — Root showcase site (apps/root)

> GOAL: Build the studio landing page that shows all apps in a
> filterable card grid. PaletteAI will appear here as the first card.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/root-site
```

### Prompt for Claude

```
Using the monorepo context, generate the complete apps/root Next.js app.
This is the studio showcase — a filterable grid of all apps.

Files to generate:

1. apps/root/package.json
   - name: "@studio/root"
   - scripts: dev (port 3000), build, lint
   - deps: next, react, react-dom, @studio/ui, @studio/utils, lucide-react
   - devDeps: @studio/tailwind-config, typescript, tailwindcss, autoprefixer

2. apps/root/next.config.ts
   - transpilePackages: ["@studio/ui", "@studio/utils"]

3. apps/root/tailwind.config.ts
   - extends @studio/tailwind-config
   - content: app/**/*.tsx, ../../packages/ui/src/**/*.tsx

4. apps/root/tsconfig.json
   - extends ../../tsconfig.base.json
   - paths: @studio/ui → packages/ui/src, @studio/utils → packages/utils/src

5. apps/root/app/layout.tsx
   - Inter font from next/font/google
   - metadata: title "Studio — AI tools by [your name]",
     description "A collection of AI-powered tools and apps"
   - dark mode class on html element

6. apps/root/app/page.tsx
   - imports HeroSection, FilterBar, AppGrid
   - server component (no "use client")

7. apps/root/data/apps.ts
   - export const APPS array with this type:
       interface AppEntry {
         slug: string
         name: string
         tagline: string
         category: "app" | "tool" | "game"
         status: "live" | "coming-soon"
         url: string
         color: string  // tailwind bg class e.g. "bg-violet-100"
         icon: string   // lucide icon name
       }
   - Include one entry: PaletteAI
       slug: "palette-ai", name: "PaletteAI",
       tagline: "Describe a mood. Get a colour palette.",
       category: "tool", status: "coming-soon",
       url: "https://palette-ai.yourdomain.dev",
       color: "bg-violet-100", icon: "Palette"

8. apps/root/components/HeroSection.tsx
   - "use client"
   - Headline: "Building useful things with AI"
   - Subline: "A mini product studio — live tools, not just demos"
   - Clean, minimal, no animation

9. apps/root/components/FilterBar.tsx
   - "use client"
   - Filter tabs: All, Apps, Tools, Games
   - Pill UI, active state with purple fill
   - Accepts activeFilter + onFilter props

10. apps/root/components/AppGrid.tsx
    - "use client"
    - Accepts apps[] and filter prop
    - Renders AppCard for each matching app
    - Shows "Coming soon" badge when status is "coming-soon"

11. apps/root/components/AppCard.tsx
    - "use client"
    - Shows icon (lucide), name, tagline, category badge, status
    - Links to app url if live, disabled style if coming-soon
    - Clean card with hover border highlight

Generate all files with complete implementations.
```

### Checkpoint 03

```bash
cd apps/root
pnpm dev              # should run on localhost:3000
# Verify: studio page loads with PaletteAI card
git add .
git commit -m "feat: root showcase site with app grid"
git push origin feat/root-site
# Open PR: feat/root-site → develop
```

---

## SECTION 04 — Shared UI components

> GOAL: Build the reusable components in packages/ui that PaletteAI
> and future apps will import.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/shared-ui-components
```

### Prompt for Claude

```
Using the monorepo context, generate complete implementations for the
shared UI components in packages/ui/src/.

All components must:
- Have "use client" at the top
- Use TypeScript with full prop types (no any)
- Use cn() from @studio/utils for class merging
- Support dark mode via Tailwind dark: variants
- Be accessible (aria labels, keyboard nav, focus rings)

Components to generate:

1. src/Button.tsx
   - variants: "primary" (purple fill), "ghost" (outline), "pill" (rounded)
   - sizes: "sm", "md", "lg"
   - props: variant, size, loading (shows spinner), disabled, onClick, children
   - loading state disables and shows a lucide Loader2 spinning icon

2. src/PillChip.tsx
   - Single selectable chip
   - props: label, selected, onClick, disabled
   - selected: purple bg + white text
   - unselected: border + muted text
   - keyboard: Enter/Space toggles

3. src/CopyButton.tsx
   - props: value (string to copy), size?: "sm" | "md"
   - copies to clipboard on click
   - shows "Copy" → "Copied!" for 1500ms then resets
   - uses lucide Copy + Check icons

4. src/ModelToggle.tsx
   - props: value: AIModel, onChange: (model: AIModel) => void
   - Two pill buttons: "Gemini" (default, green dot) | "Claude" (purple dot)
   - Imports AIModel from @studio/ai-core
   - Persists selection to localStorage key "studio:preferred-model"

5. src/Skeleton.tsx
   - props: className?, count?: number, height?: string, width?: string
   - Renders count number of pulsing grey rectangles
   - Uses Tailwind animate-pulse

6. src/ErrorState.tsx
   - props: message?: string, onRetry?: () => void
   - Shows lucide AlertCircle icon, message, optional Retry button
   - Default message: "Something went wrong. Please try again."

7. src/AppShell.tsx
   - props: title: string, backHref?: string, children: ReactNode
   - Topbar: studio logo (links to /), app title, back chevron if backHref
   - Full-height layout wrapper

8. src/index.ts
   - Barrel export of all components above

Generate each file with its complete implementation.
```

### Checkpoint 04

```bash
cd packages/ui
pnpm build            # should compile cleanly
# In apps/root, try importing { Button } from "@studio/ui"
git add .
git commit -m "feat: shared UI components — Button, PillChip, CopyButton etc"
git push origin feat/shared-ui-components
# Open PR: feat/shared-ui-components → develop
```

---

## SECTION 05 — PaletteAI: app scaffold + API layer

> GOAL: Create the apps/palette-ai Next.js app, wire up the API route
> with both providers, buildPrompt, parseColours, and rate limiting.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-api
```

### Prompt for Claude

```
Using the monorepo context, generate the apps/palette-ai app scaffold
and its complete API layer. No UI components yet.

Files to generate:

1. apps/palette-ai/package.json
   - name: "@studio/palette-ai"
   - scripts: dev (port 3001), build, lint, test
   - deps: next, react, react-dom, @studio/ui, @studio/ai-core,
     @studio/utils, lucide-react, @vercel/kv
   - devDeps: @studio/tailwind-config, typescript, tailwindcss,
     autoprefixer, vitest, @vitejs/plugin-react

2. apps/palette-ai/next.config.ts
   - transpilePackages: ["@studio/ui", "@studio/utils", "@studio/ai-core"]

3. apps/palette-ai/tailwind.config.ts
   - extends @studio/tailwind-config

4. apps/palette-ai/tsconfig.json
   - extends ../../tsconfig.base.json

5. apps/palette-ai/vitest.config.ts
   - react plugin, test environment jsdom

6. apps/palette-ai/app/layout.tsx
   - metadata: title "PaletteAI — mood to colour palette"
   - Inter font

7. apps/palette-ai/lib/types.ts
   - Export these types (palette-ai specific):
       interface Colour {
         hex: string
         name: string
         usage: "background" | "surface" | "primary" | "accent" | "text"
                | "card" | "sidebar" | "highlight" | "success"
         rationale: string
       }
       interface PaletteOptions {
         mood: string
         tone: "warm" | "cool" | "bold" | "muted" | "vibrant"
         useCase: "web-app" | "brand" | "presentation" | "social" | "print"
         audience: "kids" | "professionals" | "gen-z" | "luxury" | "healthcare" | "everyone"
         theme: "light" | "dark" | "both"
         count: 3 | 5 | 6 | 8
         model: AIModel
       }
       interface Palette {
         id: string           // nanoid
         mood: string
         colours: Colour[]
         model: AIModel
         createdAt: number    // Date.now()
       }

8. apps/palette-ai/lib/buildPrompt.ts
   - export function buildPrompt(options: PaletteOptions): string
   - Builds a prompt that:
     - States exactly how many colours to generate
     - Specifies mood, tone, use case, audience, theme
     - Demands ONLY a valid JSON array, no markdown fences, no explanation
     - Specifies the exact Colour shape expected
     - Lists allowed usage values
     - Ends with: "Respond with ONLY the JSON array. Nothing else."

9. apps/palette-ai/lib/parseColours.ts
   - export function parseColours(raw: string, count: number): Colour[]
   - Steps:
     1. Strip ```json and ``` fences if present
     2. Strip any text before the first "[" and after the last "]"
     3. JSON.parse
     4. Validate each item has hex (matching /#[0-9A-Fa-f]{6}/),
        name (string), usage (one of allowed values), rationale (string)
     5. If validation fails or wrong count, throw Error("PARSE_FAILED")
     6. Return typed Colour[]

10. apps/palette-ai/lib/providers/types.ts
    - Re-export AIModel and ProviderFn from @studio/ai-core

11. apps/palette-ai/lib/providers/index.ts
    - export async function generatePalette(options: PaletteOptions): Promise<Colour[]>
    - Imports claudeProvider and geminiProvider from @studio/ai-core
    - Routes based on options.model
    - Calls buildPrompt, passes to provider, passes result to parseColours
    - On PARSE_FAILED: retries once with stricter prompt append
      "IMPORTANT: Return ONLY the JSON array. No other text whatsoever."
    - Throws after second failure

12. apps/palette-ai/app/api/generate/route.ts
    - POST handler
    - Reads ip from x-forwarded-for header
    - Calls checkRateLimit(ip) from @studio/ai-core
    - If not allowed: return 429 with { error, waitSeconds }
    - Validates request body:
      - mood: string, min 2 chars, max 200 chars
      - tone: one of valid tones
      - useCase: one of valid use cases
      - audience: one of valid audiences
      - theme: "light" | "dark" | "both"
      - count: 3 | 5 | 6 | 8
      - model: "claude" | "gemini"
    - Calls generatePalette(options)
    - Returns { palette: Colour[], model } on success
    - Returns { error: string } with appropriate status on failure
    - Wraps entire handler in try/catch with 15s AbortController timeout

Generate all files with complete, working code.
```

### Checkpoint 05

```bash
# Add your keys to .env.local
echo "ANTHROPIC_API_KEY=your_key" >> .env.local
echo "GEMINI_API_KEY=your_key" >> .env.local

cd apps/palette-ai
pnpm dev              # should run on localhost:3001

# Test the API route directly
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mood":"rainy monday","tone":"warm","useCase":"web-app","audience":"professionals","theme":"light","count":5,"model":"gemini"}'

# Should return a JSON array of 5 colours
git add .
git commit -m "feat: palette-ai API layer — providers, buildPrompt, parseColours, route"
git push origin feat/palette-ai-api
# Open PR: feat/palette-ai-api → develop
```

---

## SECTION 06 — PaletteAI: input UI + swatch display

> GOAL: Build the MoodInput panel and SwatchGrid with both mobile
> layouts (banner+labels for 5, banner+scroll for 8).

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-ui-input-swatches
```

### Prompt for Claude

```
Using the monorepo context and palette-ai types from Section 05,
generate the input and swatch display components for apps/palette-ai.

Files to generate:

1. apps/palette-ai/hooks/usePalette.ts
   - "use client"
   - export function usePalette()
   - State: palette, isLoading, error, cooldown (seconds)
   - generate(options: PaletteOptions): calls /api/generate
   - Cooldown: 10s countdown after each generation using setInterval
   - AbortController for timeout
   - Returns { palette, isLoading, error, cooldown, generate }

2. apps/palette-ai/hooks/useHistory.ts
   - "use client"
   - Reads/writes Palette[] to localStorage key "studio:palette-history"
   - Max 20 items, newest first
   - export function useHistory(): { history, addToHistory, clearHistory }

3. apps/palette-ai/components/MoodInput.tsx
   - "use client"
   - Props: onGenerate(options: PaletteOptions) => void, isLoading, cooldown
   - Sections (in order):
     a. Textarea: mood description, max 200 chars, char counter
     b. Tone chips (PillChip from @studio/ui): warm, cool, bold, muted, vibrant
     c. Use case chips: web app, brand, presentation, social, print
     d. Audience chips: kids, professionals, gen Z, luxury, healthcare, everyone
     e. Row with Theme toggle (light/dark/both) + Count chips (3/5/6/8)
     f. Footer row: ModelToggle (left) + Generate button (right)
   - Generate button shows cooldown countdown if > 0
   - All selections stored in local state, defaulting to sensible values:
     tone: warm, useCase: web-app, audience: professionals,
     theme: light, count: 5, model: gemini
   - Example mood chips above textarea: "rainy monday",
     "summer festival", "minimal office", "golden hour", "neon city"
     — clicking pre-fills the textarea

4. apps/palette-ai/components/BannerStrip.tsx
   - "use client"
   - Props: colours: Colour[], selected: number | null,
     onSelect: (i: number) => void
   - Full-width flex row of colour segments
   - Each segment: flex:1, on hover flex:2 (CSS transition 0.2s)
   - Selected segment: flex:2 + 2px inset ring
   - height: 44px on mobile, 56px on desktop

5. apps/palette-ai/components/SwatchCard.tsx
   - "use client"
   - Props: colour: Colour, selected: boolean, onClick: () => void
   - Colour block (height 64px), name, hex (mono font), usage badge, copy button
   - Auto white/black text using getTextColour from @studio/utils

6. apps/palette-ai/components/LabelList.tsx
   - "use client"
   - Props: colours: Colour[], selected: number | null,
     onSelect: (i: number) => void
   - Used for 5-colour mobile layout
   - Each row: colour dot (24px) | name + hex + usage badge + WCAG badge | copy button
   - WCAG badge: green "AA ✓" if passes 4.5:1, red "AA ✗" if not
   - Selected row: purple left border (2px) + light purple bg

7. apps/palette-ai/components/ScrollCards.tsx
   - "use client"
   - Props: colours: Colour[], selected: number | null,
     onSelect: (i: number) => void
   - Used for 8-colour mobile layout
   - Horizontal scroll row, scroll-snap-type: x mandatory
   - Each card: 110px wide, colour block 56px, name, hex, usage
   - Selected card: 1.5px purple border

8. apps/palette-ai/components/DetailPanel.tsx
   - "use client"
   - Props: colour: Colour | null
   - Animated expand/collapse (CSS max-height transition)
   - Shows: colour swatch (40px), name, hex, HSL, usage, rationale,
     contrast ratio, WCAG AA and AAA badges, Copy hex button
   - Renders null if colour is null

9. apps/palette-ai/components/SwatchGrid.tsx
   - "use client"
   - Props: colours: Colour[], count: number
   - State: selected index
   - Desktop (md+): single flex row of SwatchCards
   - Mobile 5 colours: BannerStrip + LabelList
   - Mobile 8 colours: BannerStrip + ScrollCards
   - Below either: DetailPanel for selected colour
   - Uses useMediaQuery hook (write inline) to switch layouts

10. apps/palette-ai/components/SkeletonGrid.tsx
    - "use client"
    - Props: count: number
    - Renders count Skeleton placeholders in same layout as SwatchGrid
    - Desktop: flex row, Mobile: stacked list

Generate all files with complete implementations.
```

### Checkpoint 06

```bash
cd apps/palette-ai
pnpm dev
# Visit localhost:3001
# Verify: input panel renders, all chips work, generate button calls API,
#         swatches display, mobile layout switches at md breakpoint
git add .
git commit -m "feat: palette-ai input panel + swatch display components"
git push origin feat/palette-ai-ui-input-swatches
# Open PR: feat/palette-ai-ui-input-swatches → develop
```

---

## SECTION 07 — PaletteAI: main page + live preview + export

> GOAL: Wire everything together on the main page, add the live preview
> panel and the export panel with CSS/Tailwind/JSON tabs.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-page-preview-export
```

### Prompt for Claude

```
Using the monorepo context and all components built in previous sections,
generate the remaining components and the main page for apps/palette-ai.

Files to generate:

1. apps/palette-ai/components/LivePreview.tsx
   - "use client"
   - Props: colours: Colour[] | null
   - Renders a fake app UI (card with header, sidebar, body, button, footer)
   - Maps colours by usage role: background → bg, surface → card bg,
     primary → button + heading, accent → badge + link, text → body text
   - Falls back to neutral greys if colours is null
   - Re-renders instantly when colours prop changes
   - Has 3 layout modes: "card" | "dashboard" | "landing"
   - Toggle buttons to switch layout mode

2. apps/palette-ai/components/ExportPanel.tsx
   - "use client"
   - Props: colours: Colour[], mood: string
   - Three tabs: "CSS vars" | "Tailwind" | "JSON"
   - CSS vars tab: generates --color-{usage}: {hex} for each colour
   - Tailwind tab: generates extend.colors block as JS object
   - JSON tab: full Palette object as formatted JSON
   - Each tab has a "Copy all" button using CopyButton from @studio/ui
   - Download JSON button (creates blob download)

3. apps/palette-ai/components/HistoryDrawer.tsx
   - "use client"
   - Props: open: boolean, onClose: () => void,
     onSelect: (palette: Palette) => void
   - Slide-in from right (translateX transition)
   - Lists past palettes from useHistory hook
   - Each item: mini banner strip (5 colour segments) + mood text + date
   - Click to restore palette
   - Clear all button at bottom

4. apps/palette-ai/app/page.tsx
   - "use client"
   - Integrates: AppShell, MoodInput, SkeletonGrid, SwatchGrid,
     LivePreview, ExportPanel, HistoryDrawer
   - Uses usePalette hook for state
   - Uses useHistory hook — calls addToHistory after each generation
   - URL state: on mount, read URL hash and restore palette if present
     using decodeState from @studio/utils
     After generation, update URL hash using encodeState
   - Layout:
     Desktop: two-column — left: MoodInput (400px), right: results
     Mobile: single column — MoodInput → SwatchGrid → LivePreview → ExportPanel
   - History drawer toggled by clock icon in AppShell topbar
   - Shows SkeletonGrid while loading, SwatchGrid when palette exists
   - Shows ErrorState with retry on error

5. apps/palette-ai/app/globals.css
   - Tailwind base/components/utilities directives
   - Custom scrollbar styles for scroll-cards row (thin, rounded)
   - Smooth scroll behaviour

Generate all files with complete, working implementations.
```

### Checkpoint 07

```bash
cd apps/palette-ai
pnpm dev
# Verify full flow:
# 1. Type a mood, select options, click Generate
# 2. Skeleton shows while loading
# 3. Swatches render with banner layout on mobile
# 4. Tap a swatch → detail panel expands
# 5. Live preview updates with generated colours
# 6. Export panel copies CSS vars correctly
# 7. URL hash updates after generation
# 8. Paste URL in new tab → palette restores
# 9. History drawer shows past palettes
git add .
git commit -m "feat: palette-ai main page, live preview, export panel, history"
git push origin feat/palette-ai-page-preview-export
# Open PR: feat/palette-ai-page-preview-export → develop
```

---

## SECTION 08 — Tests + accessibility + polish

> GOAL: Write unit tests for parseColours, add keyboard navigation,
> WCAG badges, stagger animation, and example mood chips.

### GitHub commands

```bash
git checkout develop
git pull origin develop
git checkout -b feat/palette-ai-tests-polish
```

### Prompt for Claude

```
Using the monorepo context, generate tests and polish for apps/palette-ai.

Files to generate:

1. apps/palette-ai/__tests__/parseColours.test.ts
   - Uses Vitest
   - Test cases (write all 6 with full assertions):
     a. Valid JSON array of 5 colours → returns typed Colour[]
     b. JSON wrapped in ```json fences → strips and parses correctly
     c. Text before the array ("Here are your colours: [...]") → extracts array
     d. Invalid hex value → throws Error("PARSE_FAILED")
     e. Missing required field (no usage) → throws Error("PARSE_FAILED")
     f. Empty array → throws Error("PARSE_FAILED")

2. apps/palette-ai/__tests__/colourUtils.test.ts
   - Uses Vitest
   - Tests for:
     a. getTextColour("#000000") === "#ffffff"
     b. getTextColour("#ffffff") === "#1a1a1a"
     c. isWCAGAA("#000000") === true (black on white >> 4.5:1)
     d. hexToHSL("#ff0000") returns correct HSL string
     e. hexToRgb("#ffffff") returns [255, 255, 255]

3. apps/palette-ai/components/MoodInput.tsx (update)
   - Add keyboard navigation to PillChip groups:
     - Arrow keys move focus between chips in a group
     - Enter/Space selects
     - Use role="radiogroup" and role="radio" for tone/useCase/audience chips
   - Add aria-live="polite" region that announces
     "Generating palette for {mood}" when loading starts

4. apps/palette-ai/components/SwatchGrid.tsx (update)
   - Add stagger animation on render:
     - Each swatch animates in with opacity 0 → 1 + translateY 8px → 0
     - 60ms delay per item (item index × 60ms)
     - Use Tailwind animate-in or inline style animationDelay
   - Trigger re-animation on each new palette (use key={palette.id})

5. apps/palette-ai/app/page.tsx (update)
   - Add <meta name="theme-color"> that updates to first colour
     of generated palette
   - Add page title that updates to mood text after generation
     e.g. "rainy monday — PaletteAI"

Run tests with: pnpm test
Generate all files with complete implementations.
```

### Checkpoint 08

```bash
cd apps/palette-ai
pnpm test             # all 11 tests should pass
pnpm dev
# Verify:
# 1. Tab through tone chips — arrow keys move focus
# 2. Swatches animate in with stagger on each new generation
# 3. Page title updates to mood text
git add .
git commit -m "feat: tests, keyboard nav, stagger animation, a11y polish"
git push origin feat/palette-ai-tests-polish
# Open PR: feat/palette-ai-tests-polish → develop
```

---

## SECTION 09 — Vercel deployment

> GOAL: Deploy both apps to Vercel, configure env vars, update root
> app with live PaletteAI URL.

### GitHub commands

```bash
# First merge develop → main after all PRs are approved
git checkout main
git merge develop
git push origin main
```

### Vercel setup steps

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# From repo root — Vercel detects monorepo automatically
vercel

# Deploy root app
cd apps/root
vercel --prod
# Note the deployment URL e.g. studio-root.vercel.app

# Deploy palette-ai
cd ../palette-ai
vercel --prod
# Note the URL e.g. palette-ai.vercel.app
```

### Environment variables to add in Vercel dashboard

```
# For palette-ai project in Vercel:
ANTHROPIC_API_KEY     = sk-ant-...
GEMINI_API_KEY        = AIza...
KV_REST_API_URL       = https://...upstash.io
KV_REST_API_TOKEN     = ...

# Vercel KV setup:
# Vercel dashboard → Storage → Create KV database → Connect to palette-ai project
# Env vars are added automatically by Vercel after connecting
```

### Prompt for Claude

```
Generate Vercel configuration files for the monorepo deployment.

Files to generate:

1. apps/root/vercel.json
   - framework: nextjs
   - buildCommand: cd ../.. && pnpm build --filter=@studio/root
   - installCommand: cd ../.. && pnpm install
   - outputDirectory: .next

2. apps/palette-ai/vercel.json
   - framework: nextjs
   - buildCommand: cd ../.. && pnpm build --filter=@studio/palette-ai
   - installCommand: cd ../.. && pnpm install
   - outputDirectory: .next
   - headers: add CORS header for /api/* routes

3. apps/root/data/apps.ts (update)
   - Update PaletteAI entry:
     status: "live"
     url: "https://YOUR_PALETTE_AI_URL.vercel.app"
```

### Checkpoint 09

```bash
# After deployment:
# Visit your root URL — PaletteAI card should show as live with link
# Visit your palette-ai URL — full app should work
# Test: generate a palette → share URL → open in incognito → palette restores

# Tag the release
git tag -a v1.0.0 -m "PaletteAI v1.0 — Phase 1 complete"
git push origin v1.0.0
```

---

## SECTION 10 — Phase 2 features (run after Phase 1 is live)

> GOAL: Add the wow-layer features. Each is a separate branch.

### Branch per feature

```bash
# Run each independently — do not combine into one branch

git checkout -b feat/palette-ai-shareable-url
git checkout -b feat/palette-ai-history-drawer
git checkout -b feat/palette-ai-compare-mode
git checkout -b feat/palette-ai-image-upload
git checkout -b feat/palette-ai-refinement-chips
```

### Prompt per feature — paste one at a time

```
FEATURE: shareable-url
Implement URL-based palette sharing for apps/palette-ai.
On every palette generation, encode the full Palette object as base64
using encodeState from @studio/utils and write it to window.location.hash.
On page load, read the hash, decode with decodeState, and restore the
palette (bypassing the API call — just hydrate state directly from the hash).
Add a Share button in the topbar that copies the full URL to clipboard
and shows a "Link copied!" toast for 2 seconds.
The toast should be a fixed-position element at bottom-center
(use an in-flow wrapper at min-height so it doesn't use position:fixed).

---

FEATURE: compare-mode
Add a "Compare" button to MoodInput that fires both Claude and Gemini
in parallel using Promise.all. Show two SwatchGrid rows side by side
on desktop, stacked on mobile, each labelled with the model name.
Below each grid show a "Prefer this one" thumbs-up button.
Store the vote in Vercel KV: increment "votes:{model}" counter.
After voting, show "Claude: X% | Gemini: Y%" aggregate from KV.

---

FEATURE: image-upload
Add an image upload input to MoodInput (file input + camera icon button).
When an image is selected, convert it to base64 and send it to a new
API route /api/generate-from-image. The route calls claudeProvider with
a vision prompt: send the image as a base64 document alongside the text
"Extract a {count}-colour palette from this image. Return ONLY the JSON array."
Parse the response with parseColours as normal. Show image thumbnail
preview in the input panel while generating.

---

FEATURE: refinement-chips
After a palette is generated, show refinement chips below the swatches:
"make it darker", "increase contrast", "add warmth", "more vibrant",
"softer tones", "add a pop of colour".
Clicking a chip calls the API again with the existing palette colours
appended to the prompt: "Here is the current palette: {JSON}.
Refine it to be {instruction}. Return the refined palette as a JSON array
with the same format." Update the palette in place with a smooth transition.

---

FEATURE: image-upload
[see above]
```

### Final branch merge

```bash
# After each Phase 2 feature is complete and tested:
git checkout develop
git merge feat/palette-ai-[feature-name]
git push origin develop

# When all Phase 2 features are merged:
git checkout main
git merge develop
git push origin main
git tag -a v2.0.0 -m "PaletteAI v2.0 — Phase 2 complete"
git push origin v2.0.0
```

---

## QUICK REFERENCE

### Commands cheatsheet

```bash
pnpm dev                                    # run all apps
pnpm dev --filter=@studio/palette-ai        # run one app
pnpm build --filter=@studio/palette-ai      # build one app
pnpm test --filter=@studio/palette-ai       # run tests for one app
pnpm add [pkg] --filter=@studio/palette-ai  # add dep to one app
pnpm add [pkg] -w                           # add dep to root
```

### Section execution order

```
01 → GitHub + monorepo root
02 → Shared packages (ai-core, ui, utils, tailwind-config)
03 → Root showcase site
04 → Shared UI components
05 → PaletteAI API layer
06 → PaletteAI input + swatches
07 → PaletteAI page + preview + export
08 → Tests + polish
09 → Vercel deployment
10 → Phase 2 features (optional, post-launch)
```

### Adding a new app (e.g. MockMate)

```bash
git checkout develop
git checkout -b feat/mockmate-scaffold
# Copy apps/palette-ai structure
# Update apps/root/data/apps.ts with new entry
# Each new app automatically gets @studio/ui, @studio/ai-core,
# @studio/utils — install them in the new app's package.json
```
