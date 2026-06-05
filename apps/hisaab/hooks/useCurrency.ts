"use client";

import { useState, useEffect } from "react";
import type { Currency } from "@/lib/types";

const STORAGE_KEY = "studio:budget-currency";

interface UseCurrencyReturn {
  currency: Currency | null;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  saveCurrency: (c: Currency) => void;
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrency(JSON.parse(stored) as Currency);
    } else {
      setIsPickerOpen(true);
    }
  }, []);

  function openPicker(): void {
    setIsPickerOpen(true);
  }

  function closePicker(): void {
    setIsPickerOpen(false);
  }

  function saveCurrency(c: Currency): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setCurrency(c);
    setIsPickerOpen(false);
  }

  return { currency, isPickerOpen, openPicker, closePicker, saveCurrency };
}
