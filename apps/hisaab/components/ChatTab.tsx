"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button, ModelToggle } from "@studio/ui";
import { useExpenses } from "@/hooks/useExpenses";
import { useChatModel } from "@/hooks/useChatModel";
import ExpenseBubble from "./ExpenseBubble";
import UserMessageBubble from "./UserMessageBubble";
import type { Currency, Expense, ParsedExpense } from "@/lib/types";

interface ChatMessage {
  id: string;
  type: "user" | "expense";
  text?: string;
  expense?: Expense;
}

interface ChatTabProps {
  currency: Currency | null;
}

export default function ChatTab({ currency }: ChatTabProps) {
  const { expenses, isLoading: expensesLoading, add, remove } = useExpenses();
  const { model, setModel } = useChatModel();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expensesLoading && expenses.length > 0 && messages.length === 0) {
      setMessages(
        expenses.map((e) => ({
          id: e.id,
          type: "expense" as const,
          expense: e,
        })),
      );
    }
  }, [expensesLoading, expenses]);

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
        { id: expense.id, type: "expense", expense },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await remove(id);
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
            if (msg.type === "user" && msg.text) {
              return <UserMessageBubble key={msg.id} text={msg.text} />;
            }
            if (msg.type === "expense" && msg.expense && currency) {
              return (
                <ExpenseBubble
                  key={msg.id}
                  expense={msg.expense}
                  currency={currency}
                  onDelete={handleDelete}
                />
              );
            }
            return null;
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
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
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
            placeholder="What did you spend?"
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
