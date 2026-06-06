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
