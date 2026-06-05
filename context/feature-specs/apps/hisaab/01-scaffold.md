# Hisaab — Section 01: App Scaffold

## Branch

`feat/hisaab-scaffold`

## Goal

Bootstrap `apps/hisaab` so the app runs on port 3002 with three empty tabs,
dark/light mode, the correct font, and a bottom tab bar. No AI, no IndexedDB,
no real content — just the skeleton that every subsequent section builds into.

---

## Files to Create

### `apps/hisaab/package.json`

```json
{
  "name": "@studio/hisaab",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start --port 3002",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@studio/ui": "workspace:*",
    "@studio/utils": "workspace:*",
    "@studio/tailwind-config": "workspace:*",
    "next": "14.2.29",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "idb": "^8.0.0",
    "recharts": "^2.12.7",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@studio/tailwind-config": "workspace:*",
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

**Notes:**

- `idb` ^8 — the idb package wrapper for IndexedDB (see Section 03)
- `recharts` ^2 — for the donut chart (see Section 04)
- `@studio/ai-core` is NOT a dependency here — it is server-side only and
  imported inside `app/api/*/route.ts` files, not in `package.json` of the app
  (Turborepo resolves it via workspace protocol in the route files)

Wait — actually `@studio/ai-core` must be in dependencies so the API routes
can import it. Add it:

```json
"@studio/ai-core": "workspace:*"
```

---

### `apps/hisaab/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@studio/ui",
    "@studio/utils",
    "@studio/ai-core",
    "@studio/tailwind-config",
  ],
};

export default nextConfig;
```

---

### `apps/hisaab/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import baseConfig from "@studio/tailwind-config/tailwind.config.base";

const config: Config = {
  ...baseConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
```

---

### `apps/hisaab/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### `apps/hisaab/postcss.config.mjs`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### `apps/hisaab/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### `apps/hisaab/app/layout.tsx`

Server component. Sets Inter font, dark-mode class on `<html>`, metadata.

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hisaab — Expense Tracker",
  description: "Just say what you spent. Hisaab handles the rest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

### `apps/hisaab/app/page.tsx`

Client component. Owns the active tab state. Renders:

- A fixed top header (app name + currency chip + model toggle)
- Three tab panels (one visible at a time via `hidden` class)
- A fixed bottom tab bar

```typescript
"use client";

import { useState } from "react";
import { MessageCircle, PieChart, List } from "lucide-react";
import ChatTab from "@/components/ChatTab";
import SummaryTab from "@/components/SummaryTab";
import HistoryTab from "@/components/HistoryTab";
import CurrencyPickerModal from "@/components/CurrencyPickerModal";
import { useCurrency } from "@/hooks/useCurrency";

type Tab = "chat" | "summary" | "history";

const TABS: Array<{ id: Tab; label: string; Icon: React.ElementType }> = [
  { id: "chat", label: "Chat", Icon: MessageCircle },
  { id: "summary", label: "Summary", Icon: PieChart },
  { id: "history", label: "History", Icon: List },
];

export default function HisaabPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const { currency, isPickerOpen, openPicker, closePicker, saveCurrency } = useCurrency();

  return (
    <div className="flex flex-col h-dvh bg-gray-50 dark:bg-gray-950">
      {/* Top header */}
      <header className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          Hisaab
        </h1>
        {currency && (
          <button
            onClick={openPicker}
            className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            aria-label="Change currency"
          >
            {currency.code} {currency.symbol}
          </button>
        )}
      </header>

      {/* Tab panels — all mounted, inactive hidden */}
      <main className="flex-1 min-h-0">
        <div className={activeTab === "chat" ? "h-full" : "hidden"}>
          <ChatTab currency={currency} />
        </div>
        <div className={activeTab === "summary" ? "h-full" : "hidden"}>
          <SummaryTab currency={currency} />
        </div>
        <div className={activeTab === "history" ? "h-full" : "hidden"}>
          <HistoryTab currency={currency} />
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav
        className="flex-none flex border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        role="tablist"
        aria-label="App sections"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={[
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              activeTab === id
                ? "text-violet-600 dark:text-violet-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
            ].join(" ")}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </nav>

      {/* Currency picker modal — shown on first visit */}
      {isPickerOpen && (
        <CurrencyPickerModal
          onSelect={saveCurrency}
          onClose={closePicker}
        />
      )}
    </div>
  );
}
```

**Notes on the scaffold page:**

- `openPicker` function needs to be wired to `useCurrency` — the hook exposes
  an `openPicker` function for the header currency chip
- `h-dvh` uses dynamic viewport height (avoids mobile browser chrome issues)
- All three tab content components are stubs in Section 01; they render a
  `<div className="p-4 text-gray-400">Coming soon</div>` placeholder

---

### Stub Components (Section 01 only)

Create these as minimal stubs. They will be replaced in subsequent sections.

**`apps/hisaab/components/ChatTab.tsx`**

```typescript
"use client";
import type { Currency } from "@/lib/types";

interface ChatTabProps {
  currency: Currency | null;
}

export default function ChatTab({ currency }: ChatTabProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Chat — coming in Section 03
    </div>
  );
}
```

Same pattern for `SummaryTab.tsx` and `HistoryTab.tsx`.

---

### `apps/hisaab/lib/types.ts`

All app-level types. Single source of truth.

```typescript
export type Category =
  | "Food"
  | "Transport"
  | "Groceries"
  | "Shopping"
  | "Entertainment"
  | "Bills & Recharge"
  | "EMI & Rent"
  | "Health"
  | "Others";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // "YYYY-MM-DD"
  createdAt: string; // ISO timestamp
  model: AIModel;
}

export interface ParsedExpense {
  amount: number;
  category: Category;
  description: string;
  date: string; // "YYYY-MM-DD"
}

export type AIModel = "gemini" | "claude";
```

---

### `apps/hisaab/lib/categories.ts`

```typescript
import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  ShoppingBag,
  Tv,
  Zap,
  Home,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import type { Category } from "./types";

interface CategoryMeta {
  colour: string;
  Icon: React.ElementType;
  chartColour: string; // hex for Recharts (cannot use Tailwind classes)
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    colour: "text-orange-500",
    Icon: UtensilsCrossed,
    chartColour: "#f97316",
  },
  Transport: { colour: "text-blue-500", Icon: Car, chartColour: "#3b82f6" },
  Groceries: {
    colour: "text-green-500",
    Icon: ShoppingCart,
    chartColour: "#22c55e",
  },
  Shopping: {
    colour: "text-pink-500",
    Icon: ShoppingBag,
    chartColour: "#ec4899",
  },
  Entertainment: {
    colour: "text-purple-500",
    Icon: Tv,
    chartColour: "#a855f7",
  },
  "Bills & Recharge": {
    colour: "text-yellow-500",
    Icon: Zap,
    chartColour: "#eab308",
  },
  "EMI & Rent": { colour: "text-red-500", Icon: Home, chartColour: "#ef4444" },
  Health: { colour: "text-teal-500", Icon: Heart, chartColour: "#14b8a6" },
  Others: {
    colour: "text-gray-400",
    Icon: MoreHorizontal,
    chartColour: "#9ca3af",
  },
};

export const ALL_CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Groceries",
  "Shopping",
  "Entertainment",
  "Bills & Recharge",
  "EMI & Rent",
  "Health",
  "Others",
];
```

---

### `apps/hisaab/vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@studio/hisaab",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "outputDirectory": ".next"
}
```

---

## Checkpoint

After scaffold is implemented, the following must be true:

1. `pnpm dev --filter=@studio/hisaab` starts on port 3002 with no errors
2. The page renders: top header, three tab buttons, bottom nav bar
3. Clicking each tab button switches the visible panel
4. No TypeScript errors with `strict: true`
5. Dark mode is active by default (`className="dark"` on `<html>`)

---

## What Is NOT in This Section

- No real chat UI (stub only)
- No IndexedDB setup
- No AI API route
- No currency detection logic (CurrencyPickerModal is a stub that opens/closes)
- No Recharts chart
