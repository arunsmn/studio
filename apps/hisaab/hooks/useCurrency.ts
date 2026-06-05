"use client";

import { useState, useCallback, useEffect } from "react";
import type { Currency } from "@/lib/types";

const STORAGE_KEY = "studio:budget-currency";

interface UseCurrencyResult {
  currency: Currency | null;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  saveCurrency: (c: Currency) => void;
}

export function useCurrency(): UseCurrencyResult {
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCurrency(JSON.parse(raw) as Currency);
      } catch {
        setIsPickerOpen(true);
      }
    } else {
      setIsPickerOpen(true);
    }
  }, []);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const saveCurrency = useCallback((c: Currency) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setCurrency(c);
    setIsPickerOpen(false);
  }, []);

  return { currency, isPickerOpen, openPicker, closePicker, saveCurrency };
}
