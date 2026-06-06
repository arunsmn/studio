"use client";

import { useState, useCallback, useEffect } from "react";
import type { AIModel } from "@/lib/types";

const MODEL_KEY = "studio:preferred-model";

export function useChatModel(): { model: AIModel; setModel: (m: AIModel) => void } {
  const [model, setModelState] = useState<AIModel>("gemini");

  useEffect(() => {
    const stored = localStorage.getItem(MODEL_KEY);
    if (stored === "claude" || stored === "gemini") {
      setModelState(stored);
    }
  }, []);

  const setModel = useCallback((m: AIModel) => {
    localStorage.setItem(MODEL_KEY, m);
    setModelState(m);
  }, []);

  return { model, setModel };
}
