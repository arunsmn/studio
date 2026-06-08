"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@studio/ui";
import { CURRENCIES, detectCurrency } from "@/lib/currencies";
import type { Currency } from "@/lib/types";

interface CurrencyPickerModalProps {
  onSelect: (currency: Currency) => void;
  onClose: () => void;
  isDismissible?: boolean;
}

export default function CurrencyPickerModal({
  onSelect,
  onClose,
  isDismissible = false,
}: CurrencyPickerModalProps) {
  const detected = detectCurrency();
  const [selected, setSelected] = useState<Currency>(detected);
  const [search, setSearch] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = dialogRef.current?.querySelector('[aria-checked="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!isDismissible) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDismissible, onClose]);

  const handleBackdrop = useCallback(() => {
    if (isDismissible) onClose();
  }, [isDismissible, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={handleBackdrop}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-picker-heading"
        className="w-full sm:max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-5 pb-3 shrink-0">
          <div>
            <h2
              id="currency-picker-heading"
              className="text-base font-semibold text-gray-900 dark:text-gray-50"
            >
              Choose your currency
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              We detected: {detected.name} ({detected.code})
            </p>
          </div>
          {isDismissible && (
            <button
              onClick={onClose}
              aria-label="Close currency picker"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currencies..."
              aria-label="Search currencies"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Currency list */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-2 flex flex-col gap-1.5"
          role="radiogroup"
          aria-label="Currency options"
        >
          {filtered.map((c) => (
            <button
              key={c.code}
              role="radio"
              aria-checked={selected.code === c.code}
              onClick={() => setSelected(c)}
              className={[
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border text-left transition-colors",
                selected.code === c.code
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
              ].join(" ")}
            >
              <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-50 w-8 shrink-0">
                {c.code}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 w-6 shrink-0">
                {c.symbol}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {c.name}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No currencies found
            </p>
          )}
        </div>

        {/* Confirm */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onSelect(selected)}
          >
            Use {selected.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
