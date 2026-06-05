# Hisaab — Section 02: Currency Picker

## Branch

`feat/hisaab-currency-picker`

## Goal

Detect the user's likely currency from `navigator.language`, show a modal
on first visit, let the user confirm or change it, and persist the choice
to localStorage. Provide a hook so any component can read the active currency.

---

## Behaviour Specification

### First Visit

- On mount of `HisaabPage`, if `localStorage.getItem("studio:budget-currency")`
  is `null`, the `CurrencyPickerModal` opens automatically
- The modal cannot be dismissed without selecting a currency (no backdrop click
  to close, no Escape key to close)
- Once the user selects a currency and confirms, the modal closes and the choice
  is saved

### Return Visit

- If `studio:budget-currency` exists in localStorage, the modal does not open
- The currency chip in the top header shows `{code} {symbol}` (e.g. "INR ₹")
- Clicking the chip opens the modal again so the user can change their currency

### Auto-Detection

Use `navigator.language` to suggest a default currency. Map the locale's region
subtag to a currency code. Examples:

| Locale      | Detected currency |
| ----------- | ----------------- |
| `en-IN`     | INR               |
| `en-US`     | USD               |
| `en-GB`     | GBP               |
| `de-DE`     | EUR               |
| `ja-JP`     | JPY               |
| `zh-CN`     | CNY               |
| `ko-KR`     | KRW               |
| `ar-AE`     | AED               |
| Any unknown | USD               |

The suggestion is pre-selected in the list (scrolled into view) but the user
always confirms — never auto-save without a tap.

---

## Files to Create

### `apps/hisaab/lib/currencies.ts`

Defines the 25 supported currencies and the locale → currency map.

```typescript
import type { Currency } from "./types";

export const CURRENCIES: Currency[] = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
];

const LOCALE_TO_CURRENCY: Record<string, string> = {
  AE: "AED", AU: "AUD", BR: "BRL", CA: "CAD", CH: "CHF",
  CN: "CNY", DK: "DKK", DE: "EUR", FR: "EUR", IT: "EUR",
  ES: "EUR", NL: "EUR", GB: "GBP", HK: "HKD", ID: "IDR",
  IN: "INR", JP: "JPY", KR: "KRW", MX: "MXN", MY: "MYR",
  NO: "NOK", NZ: "NZD", PH: "PHP", SE: "SEK", SG: "SGD",
  TH: "THB", TR: "TRY", US: "USD", ZA: "ZAR",
};

export function detectCurrency(): Currency {
  if (typeof navigator === "undefined") return CURRENCIES.find(c => c.code === "USD")!;
  const locale = navigator.language ?? "en-US";
  const region = locale.split("-")[1]?.toUpperCase() ?? "";
  const code = LOCALE_TO_CURRENCY[region] ?? "USD";
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES.find(c => c.code === "USD")!;
}
```

---

### `apps/hisaab/hooks/useCurrency.ts`

```typescript
"use client";

import { useState, useCallback } from "react";
import type { Currency } from "@/lib/types";

const STORAGE_KEY = "studio:budget-currency";

function readFromStorage(): Currency | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Currency;
  } catch {
    return null;
  }
}

interface UseCurrencyResult {
  currency: Currency | null;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  saveCurrency: (c: Currency) => void;
}

export function useCurrency(): UseCurrencyResult {
  const [currency, setCurrency] = useState<Currency | null>(() => readFromStorage());
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(() => readFromStorage() === null);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const saveCurrency = useCallback((c: Currency) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setCurrency(c);
    setIsPickerOpen(false);
  }, []);

  return { currency, isPickerOpen, openPicker, closePicker, saveCurrency };
}
```

**Key decisions:**
- Lazy `useState` initializer reads localStorage once on mount — no `useEffect`
- `isPickerOpen` initial value is `true` when no stored currency — same lazy pattern
- `closePicker` is exported but only used for the header chip scenario (not on
  first visit, where the modal is non-dismissible)

---

### `apps/hisaab/components/CurrencyPickerModal.tsx`

Full-screen modal overlay on mobile. Centred card on desktop.

**Props:**
```typescript
interface CurrencyPickerModalProps {
  onSelect: (currency: Currency) => void;
  onClose: () => void;  // only used when re-opening from header (return visit)
  isDismissible?: boolean; // false on first visit, true on return visit
}
```

**Behaviour:**
- `isDismissible` defaults to `false` — no backdrop click, no Escape key, no X button
- When `isDismissible` is `true`: X button in top-right corner, backdrop click, Escape key all close
- The detected/suggested currency is highlighted with `border-violet-500`
- User can scroll through the full list
- Selecting a currency highlights it; a "Use {Name}" confirm button appears at the bottom
- Confirm calls `onSelect(selectedCurrency)`
- Search input at the top of the list filters currencies by name or code (case-insensitive)

**Layout:**
```
┌─────────────────────────────────┐
│ Choose your currency            [X]  ← X only if isDismissible
│ We detected: Indian Rupee (INR)
│                                  
│ [🔍 Search currencies...]       
│                                  
│ ● INR  ₹  Indian Rupee  ← pre-selected (highlighted)
│ ○ USD  $  US Dollar              
│ ○ EUR  €  Euro                   
│ ... (scrollable list)            
│                                  
│        [Use Indian Rupee]        
└─────────────────────────────────┘
```

**Accessibility:**
- Modal traps focus inside (use `tabIndex` and `onKeyDown` Escape handler)
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to heading
- Currency list items: `role="radio"`, `aria-checked`
- `aria-label` on search input: "Search currencies"

**Styling:**
- Overlay: `fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center`
- Card: `w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl`
  - Full-width bottom sheet on mobile, centred card on sm+
- List item selected: `border-violet-500 bg-violet-50 dark:bg-violet-950/20`
- List item unselected: `border-gray-200 dark:border-gray-700`
- Confirm button: `primary` variant from `@studio/ui`, full width, fixed at bottom of modal

---

## Wiring in `app/page.tsx`

The `useCurrency` hook is called in `HisaabPage`. The `openPicker` function
is passed to the header currency chip's `onClick`. The `CurrencyPickerModal`
receives `isDismissible={currency !== null}` — true on return visit, false on
first visit.

---

## Checkpoint

After this section is implemented:

1. First visit: modal opens automatically, full list visible, detected currency pre-selected
2. Search filters the list in real time
3. Selecting and confirming saves to localStorage and closes modal
4. The currency chip in the header shows the saved currency
5. Clicking the chip re-opens the modal (dismissible this time)
6. Changing currency in the modal updates the header chip
7. Refresh: modal does not reappear; header shows saved currency
8. No TypeScript errors with `strict: true`

---

## What Is NOT in This Section

- No IndexedDB interaction
- No AI calls
- The currency is stored and read but not yet used for formatting (Section 03+)
