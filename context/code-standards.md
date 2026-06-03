# Code Standards

## TypeScript Rules

- `strict: true` always — no exceptions
- Never use `any`. Use `unknown` and narrow with type guards
- Never use non-null assertion `!` unless you can prove it safe with a comment
- Prefer `interface` for object shapes, `type` for unions and aliases
- All exported functions must have explicit return types
- All API route handlers must type their request body before using it

## File and Naming Conventions

```
PascalCase    → React components, interfaces, types
camelCase     → functions, variables, hooks, file names for non-components
kebab-case    → directory names, URL slugs
UPPER_SNAKE   → environment variable names and true constants
```

- One component per file — no barrel components
- Hook files: `use[Name].ts` — always starts with `use`
- Utility files: `[name]Utils.ts` or plain `[name].ts` in `lib/`
- Test files: `[name].test.ts` in `__tests__/` directory

## Component Rules

- Client components: `"use client"` on the first line, no exceptions
- Server components: no directive, no hooks, no browser APIs
- Never import `@studio/ai-core` in a client component or hook
- Never import `@anthropic-ai/sdk` or `@google/generative-ai` outside
  of `app/api/*/route.ts` files or `packages/ai-core/src/`
- Props interfaces: always named `[ComponentName]Props`
- Children prop: always type as `React.ReactNode`, never `JSX.Element`
- Event handlers: always named `on[Event]` in props, `handle[Event]` in impl

## Import Order (enforced mentally, ESLint optional)

1. React and Next.js imports
2. Third-party packages
3. `@studio/*` package imports
4. Relative imports (components, hooks, lib, types)
5. Style imports (if any)

## API Route Standards

Every `route.ts` must:
1. Read IP from `x-forwarded-for` header immediately
2. Call `checkRateLimit(ip)` before any other logic
3. Validate and sanitise the entire request body before use
4. Wrap the main logic in try/catch
5. Use `AbortController` with 15-second timeout on AI calls
6. Return typed `Response.json()` with appropriate HTTP status codes
7. Never log sensitive data (API keys, full request bodies)

Validation rules for PaletteAI `/api/generate`:
- `mood`: string, min 2 chars, max 200 chars, strip HTML tags
- `tone`: must be one of the union type values — validate explicitly
- `useCase`: must be one of the union type values
- `audience`: must be one of the union type values
- `theme`: must be "light" | "dark" | "both"
- `count`: must be 3 | 5 | 6 | 8
- `model`: must be "claude" | "gemini"

## Forbidden Patterns

- ❌ `any` type
- ❌ `// TODO`, `// FIXME`, `// add logic here` in generated files
- ❌ Inline styles except where dynamically computed (e.g. `style={{ background: hex }}`)
- ❌ `console.log` in production code — use structured logging or remove
- ❌ Module-level mutable state in API routes (resets on Vercel cold starts)
- ❌ Importing AI SDKs in client components or shared packages
- ❌ `localStorage` access outside of hooks (SSR will break)
- ❌ Hardcoded port numbers, URLs, or API endpoints outside of config
- ❌ Copy-pasting logic between apps — extract to a package instead
- ❌ `default export` for utilities — named exports only
- ❌ `export default` for types — always named
- ❌ Nested ternaries more than one level deep — use early returns instead

## Error Handling

- AI provider failures: catch, log error type (not message), return 503
- Rate limit exceeded: return 429 with `{ error, waitSeconds }`
- Validation failure: return 400 with `{ error: "field: reason" }`
- Parse failure (AI returned bad JSON): retry once, then return 502
- Client-side: always show ErrorState component, never raw error strings
- Never expose stack traces or internal error messages to the client

## Testing Standards

- Test runner: Vitest
- Test location: `__tests__/` directory at app root
- Naming: `[subject].test.ts`
- Each test file must have at minimum:
  - A happy-path test
  - A malformed-input test
  - A boundary/edge-case test
- No snapshot tests — test behaviour, not markup
- Mock AI provider responses with static fixtures — never call real APIs in tests

## localStorage Access Pattern

Always guard with SSR check:
```ts
// In hooks only — never in components or utilities
const [value, setValue] = useState(() => {
  if (typeof window === "undefined") return defaultValue
  const stored = localStorage.getItem(KEY)
  return stored ? JSON.parse(stored) : defaultValue
})
```

## Environment Variables

- Never hardcode keys — always use `process.env.VAR_NAME`
- Client-exposed vars must be prefixed `NEXT_PUBLIC_`
- AI keys are never `NEXT_PUBLIC_` — they are server-only
- All required env vars documented in `.env.example` at repo root
- If a required env var is missing, throw a clear error at startup:
  ```ts
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  ```

## Commit Message Format

```
type: short description (max 72 chars)

Types: feat, fix, refactor, test, docs, chore
Examples:
  feat: add BannerStrip component with hover expand
  fix: parseColours fails on JSON with leading text
  refactor: extract urlState to @studio/utils
  test: add edge cases for parseColours
```
