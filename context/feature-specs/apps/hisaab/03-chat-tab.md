# Hisaab — Section 03: Chat Tab

## Branch

`feat/hisaab-chat-tab`

## Goal

Replace the ChatTab stub with a fully working chat interface: user types
an expense message, AI parses it, the result is saved to IndexedDB, and
an expense bubble appears in the conversation. Expenses can be deleted
with inline confirmation.

---

## Layout

```
┌─────────────────────────────────┐  ← fixed top header (from page.tsx)
│ Hisaab               INR ₹  [G] │  ← [G] = ModelToggle (Gemini/Claude)
├─────────────────────────────────┤
│                                 │  ↑
│  (empty state when no expenses) │  │ scrollable
│                                 │  │ bubble area
│  ┌─────────────────────────┐    │  │
│  │ 250 · Food              │    │  │ ← expense bubble (AI reply)
│  │ Lunch at Subway         │    │  │
│  │ Today · ₹250       [🗑] │    │  │
│  └─────────────────────────┘    │  │
│                    [user msg]   │  │ ← user message bubble (right)
│                                 │  ↓
├─────────────────────────────────┤
│ [spent 250 on lunch    ] [Send] │  ← sticky input bar
└─────────────────────────────────┘  ← fixed bottom tab bar (from page.tsx)
```

The bubble area auto-scrolls to the bottom when a new expense is added.

The `ModelToggle` is placed in the top-right corner of the chat tab's own
header section (inside the tab panel, not on `page.tsx` — the page header
only has the app title and currency chip).

---

## IndexedDB Setup

### `apps/hisaab/lib/db.ts`

Wraps `idb` package. Single function to open (or reuse) the database.

```typescript
import { openDB, type IDBPDatabase } from "idb";
import type { Expense } from "./types";

const DB_NAME = "hisaab-db";
const DB_VERSION = 1;
const STORE_NAME = "expenses";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-date", "date");
        store.createIndex("by-category", "category");
      },
    });
  }
  return dbPromise;
}

export async function addExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, expense);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
```

**Notes:**

- `dbPromise` is module-level — this is acceptable in a browser context because
  the module is only ever loaded client-side. Do NOT do this in API routes.
- `put` is used instead of `add` so that if a retry somehow sends the same ID
  twice, it is idempotent.

---

## `apps/hisaab/hooks/useExpenses.ts`

Custom hook. Loads all expenses from IndexedDB on mount, provides `add` and
`remove` functions that update both IndexedDB and local React state atomically.

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { addExpense, deleteExpense, getAllExpenses } from "@/lib/db";
import type { Expense } from "@/lib/types";

interface UseExpensesResult {
  expenses: Expense[];
  isLoading: boolean;
  add: (expense: Expense) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useExpenses(): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllExpenses()
      .then(setExpenses)
      .finally(() => setIsLoading(false));
  }, []);

  const add = useCallback(async (expense: Expense) => {
    await addExpense(expense);
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, isLoading, add, remove };
}
```

**Note:** `useEffect` is allowed here for the initial load from an async browser
API (IndexedDB). This is one of the valid exceptions — it is not data fetching
from a server, it is a one-time read from a local async source.

---

## AI Parse API Route

### `apps/hisaab/app/api/parse-expense/route.ts`

```typescript
import { NextRequest } from "next/server";
import { checkRateLimit } from "@studio/ai-core";
import { generateParsedExpense } from "@/lib/providers";

export async function POST(req: NextRequest): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const limit = await checkRateLimit(ip);
  if (!limit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded", waitSeconds: limit.waitSeconds },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).message !== "string" ||
    typeof (body as Record<string, unknown>).currency !== "string" ||
    !["gemini", "claude"].includes(
      (body as Record<string, unknown>).model as string,
    )
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { message, currency, model } = body as {
    message: string;
    currency: string;
    model: "gemini" | "claude";
  };

  if (message.length < 2 || message.length > 500) {
    return Response.json(
      { error: "message: must be 2–500 characters" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const parsed = await generateParsedExpense({ message, currency, model });
    if (parsed.amount <= 0) {
      return Response.json(
        { error: "amount: must be a positive number" },
        { status: 400 },
      );
    }
    return Response.json(parsed);
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    if (code === "PARSE_FAILED") {
      return Response.json(
        { error: "AI response could not be parsed" },
        { status: 502 },
      );
    }
    return Response.json({ error: "AI service unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## AI Provider Strategy (Hisaab-specific)

### `apps/hisaab/lib/providers/index.ts`

```typescript
import { claudeProvider, geminiProvider } from "@studio/ai-core";
import { buildExpensePrompt } from "@/lib/buildExpensePrompt";
import { parseExpense } from "@/lib/parseExpense";
import type { AIModel, ParsedExpense } from "@/lib/types";

interface GenerateOptions {
  message: string;
  currency: string;
  model: AIModel;
}

export async function generateParsedExpense(
  options: GenerateOptions,
): Promise<ParsedExpense> {
  const provider = options.model === "claude" ? claudeProvider : geminiProvider;
  const prompt = buildExpensePrompt(options.message, options.currency);

  let raw: string;
  try {
    raw = await provider(prompt);
  } catch {
    throw new Error("PROVIDER_FAILED");
  }

  try {
    return parseExpense(raw);
  } catch {
    // retry once with a stricter prompt suffix
    const retryPrompt =
      prompt +
      "\n\nIMPORTANT: Respond with ONLY the JSON object. No prose, no markdown.";
    const retryRaw = await provider(retryPrompt);
    return parseExpense(retryRaw);
  }
}
```

---

### `apps/hisaab/lib/buildExpensePrompt.ts`

```typescript
import { ALL_CATEGORIES } from "./categories";

export function buildExpensePrompt(message: string, currency: string): string {
  const today = new Date().toISOString().split("T")[0];
  const categoryList = ALL_CATEGORIES.join(", ");

  return `You are a financial assistant that extracts expense data from natural language.

Today's date: ${today}
User's currency: ${currency}

Parse the following message and return a JSON object with exactly these fields:
- amount: number (positive, no currency symbol)
- category: one of [${categoryList}]
- description: string (short, 3–8 words, title-case)
- date: string (YYYY-MM-DD format; infer from message or use today's date)

Rules:
- If the user says "yesterday", subtract one day from today
- If the user says a day name ("Monday"), use the most recent past occurrence
- If category is unclear, use "Others"
- description should be concise and human-readable
- Return ONLY the JSON object with no explanation

User message: "${message}"`;
}
```

---

### `apps/hisaab/lib/parseExpense.ts`

````typescript
import { ALL_CATEGORIES } from "./categories";
import type { ParsedExpense, Category } from "./types";

export function parseExpense(raw: string): ParsedExpense {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("PARSE_FAILED");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).amount !== "number" ||
    typeof (parsed as Record<string, unknown>).category !== "string" ||
    typeof (parsed as Record<string, unknown>).description !== "string" ||
    typeof (parsed as Record<string, unknown>).date !== "string"
  ) {
    throw new Error("PARSE_FAILED");
  }

  const { amount, category, description, date } = parsed as {
    amount: number;
    category: string;
    description: string;
    date: string;
  };

  const validCategory: Category = ALL_CATEGORIES.includes(category as Category)
    ? (category as Category)
    : "Others";

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const validDate = datePattern.test(date)
    ? date
    : new Date().toISOString().split("T")[0];

  return { amount, category: validCategory, description, date: validDate };
}
````

---

## Chat Components

### `apps/hisaab/components/ChatTab.tsx`

Replaces the stub. Owns the input state and the chat message list (user
messages + expense bubbles interleaved). Reads/writes expenses via `useExpenses`.

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ModelToggle } from "@studio/ui";
import { useExpenses } from "@/hooks/useExpenses";
import { useChatModel } from "@/hooks/useChatModel";
import ExpenseBubble from "./ExpenseBubble";
import UserMessageBubble from "./UserMessageBubble";
import type { Currency, Expense, ParsedExpense } from "@/lib/types";

interface ChatMessage {
  id: string;
  type: "user" | "expense";
  text?: string; // for user messages
  expense?: Expense; // for expense bubbles
}

interface ChatTabProps {
  currency: Currency | null;
}

export default function ChatTab({ currency }: ChatTabProps) {
  const { expenses, add, remove } = useExpenses();
  const { model, setModel } = useChatModel();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // initialise messages from persisted expenses on mount
  useEffect(() => {
    if (expenses.length > 0 && messages.length === 0) {
      setMessages(
        expenses.map((e) => ({
          id: e.id,
          type: "expense" as const,
          expense: e,
        })),
      );
    }
  }, [expenses]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading || !currency) return;
    const userText = input.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          currency: currency.code,
          model,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        throw new Error(data.error);
      }

      const parsed = (await res.json()) as ParsedExpense;
      const expense: Expense = {
        ...parsed,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        model,
      };

      await add(expense);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "expense", expense },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // ... render
}
```

**Note:** The `messages` state in `ChatTab` is session-only (in-memory chat
history). On page refresh, only the `expenses` from IndexedDB are shown —
the user messages ("spent 250 on lunch") are not persisted. This is intentional
and aligns with the chatbot UX convention. On refresh, the bubble area shows
all persisted expense bubbles (no user message bubbles).

---

### `apps/hisaab/components/ExpenseBubble.tsx`

Displays a parsed expense. Left-aligned (AI response style).

```typescript
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CATEGORY_META } from "@/lib/categories";
import type { Expense, Currency } from "@/lib/types";

interface ExpenseBubbleProps {
  expense: Expense;
  currency: Currency;
  onDelete: (id: string) => Promise<void>;
}
```

**Layout:**

```
┌─────────────────────────────────┐
│ [🍽] Food                  [🗑] │
│ Lunch at Subway                 │
│ Today · ₹250.00                 │
└─────────────────────────────────┘
```

- Category icon in `colour` from `CATEGORY_META`
- Amount formatted as `{symbol}{amount.toFixed(2)}`
- Date displayed as "Today", "Yesterday", or "DD MMM" (e.g. "3 Jun")
- Delete icon (`Trash2`, `w-4 h-4`) in top-right corner
- Clicking delete shows inline confirmation (see below)

**Delete Confirmation (inline, not a modal):**

When the trash icon is clicked, it transforms into:

```
│ Delete this expense?  [Cancel] [Delete] │
```

- Two buttons appear inline: `ghost` "Cancel" and a red "Delete"
- If Delete is confirmed: `onDelete(expense.id)` is called and the bubble
  animates out (opacity 0 + scale 95, 150ms)
- If Cancel: reverts to normal bubble

**Styling:**

- Background: `bg-white dark:bg-gray-900`
- Border: `border border-gray-200 dark:border-gray-800`
- Rounded: `rounded-2xl rounded-tl-sm`
- Max width: `max-w-[85%]`
- Aligned: `self-start` (left side of flex column)

---

### `apps/hisaab/components/UserMessageBubble.tsx`

Simple right-aligned chat bubble for the user's original text.

```
                      ┌────────────────┐
                      │ spent 250 on   │
                      │ lunch          │
                      └────────────────┘
```

- Background: `bg-violet-600 text-white`
- Rounded: `rounded-2xl rounded-tr-sm`
- Max width: `max-w-[75%]`
- Aligned: `self-end`

---

### `apps/hisaab/hooks/useChatModel.ts`

Reads/writes the AI model preference to localStorage.

```typescript
"use client";

import { useState, useCallback } from "react";
import type { AIModel } from "@/lib/types";

const MODEL_KEY = "studio:preferred-model";

export function useChatModel() {
  const [model, setModelState] = useState<AIModel>(() => {
    if (typeof window === "undefined") return "gemini";
    return (localStorage.getItem(MODEL_KEY) as AIModel) ?? "gemini";
  });

  const setModel = useCallback((m: AIModel) => {
    localStorage.setItem(MODEL_KEY, m);
    setModelState(m);
  }, []);

  return { model, setModel };
}
```

---

## Empty State

When `messages` array is empty (fresh install, or after all expenses deleted):

```
┌─────────────────────────────────┐
│                                 │
│        💬                       │
│   Start tracking expenses       │
│   Just type what you spent      │
│                                 │
│   "spent 250 on lunch"          │
│   "paid 1200 for groceries"     │
│   "uber to airport 450"         │
│                                 │
└─────────────────────────────────┘
```

Displayed in a centred flex column with `text-gray-400` hint texts. No button —
the input below is the CTA.

---

## Input Bar

Fixed to the bottom of the `ChatTab` panel (above the bottom tab bar).

```
┌──────────────────────────────────────────┐
│ [What did you spend?...       ] [→ Send] │
└──────────────────────────────────────────┘
```

- Textarea (single line height, max 3 lines) with `resize-none`
- On Enter (without Shift): submits
- On Shift+Enter: new line
- Send button: `primary` variant, disabled when `input.trim() === ""` or loading
- When loading: Send button shows `<Loader2 className="animate-spin" />`
- Error: shown in a small red text above the input bar, dismisses on next keystroke

---

## Checkpoint

After this section:

1. Typing an expense message and pressing Send/Enter calls the API
2. A user bubble and an expense bubble both appear in the chat
3. The expense is persisted to IndexedDB (verify by refreshing — bubbles remain)
4. Deleting an expense: inline confirmation → remove from IndexedDB + chat
5. ModelToggle switches between Gemini and Claude (persisted to localStorage)
6. Loading state: input disabled, spinner on send button
7. Error state: message shown above input, disappears on next keystroke
8. Auto-scroll to bottom after new bubble added
9. No TypeScript errors

---

## What Is NOT in This Section

- Summary tab logic (reads from IndexedDB but doesn't render yet)
- History tab logic
- CSV export
