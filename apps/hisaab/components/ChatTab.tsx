"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button, ModelToggle } from "@studio/ui";
import { useChatModel } from "@/hooks/useChatModel";
import ExpenseBubble from "./ExpenseBubble";
import type { Currency, Expense, ParsedExpense, ParseExpenseResult, PartialExpense } from "@/lib/types";

interface ChatMessage {
  id: string;
  type: "expense" | "assistant";
  expense?: Expense;
  text?: string;
}

function extractAmount(text: string): number | null {
  const match = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

interface ChatTabProps {
  currency: Currency | null;
  expenses: Expense[];
  expensesLoading: boolean;
  onAdd: (expense: Expense) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export default function ChatTab({
  currency,
  expenses,
  expensesLoading,
  onAdd,
  onRemove,
}: ChatTabProps) {
  const { model, setModel } = useChatModel();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPartial, setPendingPartial] = useState<PartialExpense | null>(null);
  const [pendingMultiple, setPendingMultiple] = useState<ParsedExpense[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expensesLoading) return;

    setMessages((prev) => {
      // Initial load — populate from IndexedDB
      if (prev.length === 0 && expenses.length > 0) {
        return [...expenses].reverse().map((e) => ({
          id: e.id,
          type: "expense" as const,
          expense: e,
        }));
      }
      // Sync deletions from other tabs
      if (prev.length > 0) {
        const expenseIds = new Set(expenses.map((e) => e.id));
        const updated = prev.filter(
          (m) => m.type !== "expense" || expenseIds.has(m.expense!.id),
        );
        return updated.length !== prev.length ? updated : prev;
      }
      return prev;
    });
  }, [expensesLoading, expenses]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function addExpense(parsed: ParsedExpense) {
    const expense: Expense = {
      ...parsed,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      model,
    };
    await onAdd(expense);
    setMessages((prev) => [
      ...prev,
      { id: expense.id, type: "expense", expense },
    ]);
  }

  function addAssistantMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "assistant", text },
    ]);
  }

  async function handleSend() {
    if (!input.trim() || isLoading || !currency) return;
    const userText = input.trim();
    setInput("");
    setError(null);

    if (pendingMultiple) {
      const normalized = userText.toLowerCase();
      const isYes = ["yes", "y", "yeah", "yep", "confirm", "ok", "okay"].includes(normalized);
      const isNo = ["no", "n", "nope", "cancel"].includes(normalized);

      if (isYes) {
        setIsLoading(true);
        try {
          for (const parsed of pendingMultiple) {
            await addExpense(parsed);
          }
        } finally {
          setIsLoading(false);
          setPendingMultiple(null);
        }
        return;
      }

      if (isNo) {
        addAssistantMessage("Okay, I won't add those.");
        setPendingMultiple(null);
        return;
      }

      setError('Please reply "yes" or "no"');
      return;
    }

    if (pendingPartial) {
      const amount = extractAmount(userText);
      if (amount === null || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      setIsLoading(true);
      try {
        await addExpense({ ...pendingPartial, amount });
      } finally {
        setIsLoading(false);
        setPendingPartial(null);
      }
      return;
    }

    setIsLoading(true);

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

      const result = (await res.json()) as ParseExpenseResult;

      if (result.type === "complete") {
        await addExpense(result.expense);
      } else if (result.type === "needsAmount") {
        setPendingPartial(result.partial);
        addAssistantMessage(`How much did you spend on ${result.partial.description}?`);
      } else {
        setPendingMultiple(result.expenses);
        const lines = result.expenses
          .map((e) => `${e.description}: ${currency.symbol}${e.amount.toFixed(2)}`)
          .join("\n");
        addAssistantMessage(
          `I found ${result.expenses.length} expenses. Would you like me to record:\n${lines}\n\nReply "yes" to confirm or "no" to cancel.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await onRemove(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header with ModelToggle */}
      <div className="flex-none flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <ModelToggle value={model} onChange={setModel} />
      </div>

      {/* Bubble area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <MessageCircle className="w-10 h-10 text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              Start tracking expenses
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Just type what you spent
            </p>
            <div className="flex flex-col gap-1 mt-2">
              {[
                '"spent 250 on lunch"',
                '"paid 1200 for groceries"',
                '"uber to airport 450"',
              ].map((hint) => (
                <p
                  key={hint}
                  className="text-xs text-gray-300 dark:text-gray-700 font-mono"
                >
                  {hint}
                </p>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "expense") {
              return currency ? (
                <ExpenseBubble
                  key={msg.id}
                  expense={msg.expense!}
                  currency={currency}
                  onDelete={handleDelete}
                />
              ) : null;
            }
            return (
              <div
                key={msg.id}
                className="self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line"
              >
                {msg.text}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="self-start flex gap-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-none px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              pendingPartial
                ? "Enter the amount…"
                : pendingMultiple
                  ? 'Reply "yes" or "no"'
                  : "What did you spend?"
            }
            rows={1}
            disabled={isLoading || !currency}
            aria-label="Expense message"
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 max-h-[4.5rem] overflow-y-auto disabled:opacity-50"
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleSend()}
            disabled={!input.trim() || !currency}
            loading={isLoading}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
