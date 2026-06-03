# Studio — AI Agent Instructions

## Before You Write a Single Line of Code

This is a pnpm + Turborepo monorepo. Package names, import paths, and
workspace conventions are non-negotiable. Do not assume — read the
context files below first.

Next.js 14 with the App Router is used. APIs, file conventions, and
data-fetching patterns may differ from your training data.
Read `node_modules/next/dist/docs/` if in doubt. Heed deprecation notices.

---

## Read These Files in Order Before Any Implementation

1. `context/project-overview.md`     — what we are building, why, and for whom
2. `context/architecture-context.md` — monorepo structure, package boundaries, invariants
3. `context/ui-context.md`           — design system, colours, typography, component rules
4. `context/code-standards.md`       — TypeScript rules, file conventions, forbidden patterns
5. `context/ai-workflow-rules.md`    — how to scope work, deliver, and stay in bounds
6. `context/progress-tracker.md`     — current phase, what is done, what is next

---

## Mandatory Rules

- Read ALL six files before touching any code.
- Update `context/progress-tracker.md` after every meaningful implementation change.
- If your implementation changes architecture, scope, or standards — update
  the relevant context file BEFORE continuing, not after.
- Never use `any` in TypeScript.
- Never generate placeholder comments like `// TODO: add logic here`.
  Every generated file must be complete and working.
- API keys are server-side only. Never import AI SDKs in client components.
- The shared packages are `@studio/ui`, `@studio/ai-core`, `@studio/utils`,
  `@studio/tailwind-config`. Import from these — never duplicate logic.
