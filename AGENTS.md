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

1. `context/project-overview.md` — what we are building, why, and for whom
2. `context/architecture-context.md` — monorepo structure, package boundaries, invariants
3. `context/ui-context.md` — design system, colours, typography, component rules
4. `context/code-standards.md` — TypeScript rules, file conventions, forbidden patterns
5. `context/ai-workflow-rules.md` — how to scope work, deliver, and stay in bounds
6. `context/progress-tracker.md` — current phase, what is done, what is next

---

## Mandatory Rules

- Read ALL six files before touching any code.
- Never use `any` in TypeScript.
- Never generate placeholder comments like `// TODO: add logic here`.
  Every generated file must be complete and working.
- API keys are server-side only. Never import AI SDKs in client components.
- The shared packages are `@studio/ui`, `@studio/ai-core`, `@studio/utils`,
  `@studio/tailwind-config`. Import from these — never duplicate logic.

## After Every Section — Non-Negotiable

When a section is fully implemented and the checkpoint passes,
you MUST do the following before ending your response:

1. Update `context/progress-tracker.md`:
   - Change the section status from 🔄 to ✅ in the status table
   - Add a detailed entry under Completed Work
   - Update In Progress to the next section
   - Update Next Steps
   - Update Current Phase if needed

2. Show the git commands to commit and push:

```bash
   git add .
   git commit -m "feat: [section name]"
   git push origin [branch-name]
```

3. Show the PR command:

```bash
   gh pr create --base develop --title "feat: [section name]" --body "Completes Section X"
```

Do not wait to be asked. Do not skip this. It is part of completing a section.
