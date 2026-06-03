# Project Overview

## What Is This

Studio is a personal AI product studio — a monorepo that contains a root
showcase site and individual AI-powered apps, tools, and games. It is
built by a frontend developer to demonstrate product thinking, AI
integration, and senior-level frontend architecture skills to potential employers.

## The Studio Philosophy

- Every app is live, not a mockup
- Every app is usable by non-technical people
- Every app demonstrates AI usage in a way that is immediately obvious
- The root site presents all apps as a coherent product studio, not a list of projects

## Apps in This Repo

### Root site (`apps/root`)

- URL: yourdomain.dev
- Purpose: filterable grid of all apps — categories: apps, tools, games
- Stack: Next.js 14, Tailwind, no backend

### PaletteAI (`apps/palette-ai`)

- URL: palette-ai.yourdomain.dev
- Tagline: Describe a mood. Get a colour palette.
- Category: tool
- Target users: designers, developers, small business owners, anyone
  who needs a colour palette without knowing colour theory
- Core loop: user types a mood → selects use case / audience / theme /
  count → Claude or Gemini returns 5 or 8 named colours as JSON →
  swatches render with live preview and export options
- Phase 1: working core (mood input → palette → copy hex)
- Phase 2: live preview, export panel, history drawer, shareable URL,
  refinement chips, image upload

## Planned Future Apps (placeholders only — not built yet)

- MockMate: AI mock interview with live scoring
- BudgetBuddy: chat-style expense tracker with NLP parsing
- RightsReader: upload contract → plain English summary

## Goals by Role

### As a frontend developer building this

- Demonstrate: TypeScript, Next.js App Router, monorepo architecture,
  AI API integration, responsive design, accessibility
- Show: product thinking (real users, real problems, real solutions)
- Avoid: over-engineering, unused abstractions, premature optimisation

### For non-technical users of the apps

- Zero signup required
- Plain English inputs throughout
- Results that are immediately useful and copyable
- Mobile-first layouts that actually work

## Non-Goals

- User accounts or authentication (Phase 1 and 2)
- Database persistence (localStorage and URL state only)
- Monetisation (not relevant for portfolio phase)
- Analytics (not relevant for portfolio phase)
