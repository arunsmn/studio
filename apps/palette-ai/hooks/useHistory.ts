"use client";

import { useState, useCallback } from "react";
import type { Palette } from "../lib/types";

const STORAGE_KEY = "studio:palette-history";
const MAX_HISTORY = 20;

interface UseHistoryReturn {
  history: Palette[];
  addToHistory: (palette: Palette) => void;
  clearHistory: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<Palette[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Palette[]) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((palette: Palette) => {
    setHistory((prev) => {
      const next = [palette, ...prev.filter((p) => p.id !== palette.id)].slice(
        0,
        MAX_HISTORY
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
