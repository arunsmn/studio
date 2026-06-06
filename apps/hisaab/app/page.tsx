"use client";

import { useState } from "react";
import { MessageCircle, PieChart, List } from "lucide-react";
import ChatTab from "@/components/ChatTab";
import SummaryTab from "@/components/SummaryTab";
import HistoryTab from "@/components/HistoryTab";
import CurrencyPickerModal from "@/components/CurrencyPickerModal";
import { useCurrency } from "@/hooks/useCurrency";
import { useExpenses } from "@/hooks/useExpenses";

type Tab = "chat" | "summary" | "history";

const TABS: Array<{ id: Tab; label: string; Icon: React.ElementType }> = [
  { id: "chat", label: "Chat", Icon: MessageCircle },
  { id: "summary", label: "Summary", Icon: PieChart },
  { id: "history", label: "History", Icon: List },
];

export default function HisaabPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const { currency, isPickerOpen, openPicker, closePicker, saveCurrency } = useCurrency();
  const { expenses, isLoading: expensesLoading, add, remove } = useExpenses();

  return (
    <div className="flex flex-col h-dvh bg-gray-50 dark:bg-gray-950">
      <header className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          Hisaab
        </h1>
        {currency && (
          <button
            onClick={openPicker}
            className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            aria-label="Change currency"
          >
            {currency.code} {currency.symbol}
          </button>
        )}
      </header>

      <main className="flex-1 min-h-0">
        <div className={activeTab === "chat" ? "h-full" : "hidden"}>
          <ChatTab
            currency={currency}
            expenses={expenses}
            expensesLoading={expensesLoading}
            onAdd={add}
            onRemove={remove}
          />
        </div>
        <div className={activeTab === "summary" ? "h-full" : "hidden"}>
          <SummaryTab currency={currency} expenses={expenses} />
        </div>
        <div className={activeTab === "history" ? "h-full" : "hidden"}>
          <HistoryTab
            currency={currency}
            expenses={expenses}
            onRemove={remove}
          />
        </div>
      </main>

      <nav
        className="flex-none flex border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        role="tablist"
        aria-label="App sections"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={[
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              activeTab === id
                ? "text-violet-600 dark:text-violet-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
            ].join(" ")}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </nav>

      {isPickerOpen && (
        <CurrencyPickerModal
          onSelect={saveCurrency}
          onClose={closePicker}
          isDismissible={currency !== null}
        />
      )}
    </div>
  );
}
