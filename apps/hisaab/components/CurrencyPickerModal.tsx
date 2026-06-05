"use client";

import type { Currency } from "@/lib/types";

interface CurrencyPickerModalProps {
  onSelect: (c: Currency) => void;
  onClose: () => void;
}

export default function CurrencyPickerModal({ onSelect, onClose }: CurrencyPickerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Select currency"
    >
      <div className="w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-1">
          Choose your currency
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Currency picker coming in Section 02.
        </p>
        <button
          onClick={() => onSelect({ code: "INR", symbol: "₹", name: "Indian Rupee" })}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Continue with INR ₹
        </button>
      </div>
    </div>
  );
}
