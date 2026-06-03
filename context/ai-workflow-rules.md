# AI Workflow Rules

## How to Receive a Task

When given a task, do this before writing any code:

1. Read all six context files in order (you are reading one now)
2. Identify which section of the spec this task belongs to
3. Identify which files need to be created or modified
4. Check `context/progress-tracker.md` to confirm this work is next
5. Confirm your understanding in one sentence before generating code

## Scoping Rules

- Implement exactly what the task specifies — no more, no less
- Do not add features that were not requested, even "helpful" ones
- Do not refactor code outside the scope of the current task
- Do not change component APIs (props, return types) without explicit instruction
- If a task is ambiguous, ask one clarifying question before proceeding

## Delivery Rules

- Every generated file must be complete — no placeholders, no TODOs
- Every file must compile cleanly with `strict: true` TypeScript
- Every component must be accessible (see ui-context.md accessibility rules)
- Every API route must have input validation and rate limiting
- After delivering a section, state what was created and what to run next

## File Generation Format

When generating a file, always output in this format:

```
### `path/to/file.ts`
[complete file contents]
```

Always include the full relative path from the repo root.
Never omit a file that was requested.
Never truncate a file midway — if context is getting long, say so
and ask which file to prioritise.

## Update Rules for Context Files

After completing a section of work, update `context/progress-tracker.md`:
- Move completed items from "In Progress" to "Completed"
- Add any new open questions that emerged during implementation
- Update "Next Steps" to reflect what comes after the current section

If your implementation requires a deviation from `architecture-context.md`
or `code-standards.md`, update that file first and explain the reason
before continuing with the implementation.

## What Not to Do

- Do not add authentication, databases, or external services not in the spec
- Do not change the monorepo package names or import paths
- Do not switch UI libraries (no shadcn, no Radix, no MUI)
- Do not use `useEffect` for data fetching — use custom hooks
- Do not generate code that calls AI APIs from the browser
- Do not generate `any` types under any circumstances
- Do not add dependencies not listed in architecture-context.md without
  flagging it and asking for confirmation first

## Handling Ambiguity

If a task conflicts with an existing context file:
1. Point out the conflict explicitly
2. Ask which takes priority
3. Do not guess and implement — wait for clarification

If a task is entirely clear:
1. State which files you will create
2. Generate them in order
3. State the checkpoint command to verify the work

## Branch Naming (remind the user when starting a new section)

```
feat/[section-name]     ← new feature or section of the spec
fix/[what-is-broken]    ← bug fix
refactor/[what-changed] ← refactor with no behaviour change
```

Always remind the user to:
1. `git checkout develop && git pull origin develop`
2. `git checkout -b feat/[branch-name]`
before starting each new section.

## Session Continuity

At the start of a new session, Claude reads all six context files.
This replaces the need to copy-paste a context block.
The progress-tracker tells Claude exactly where we left off.
No history needs to be re-explained.
