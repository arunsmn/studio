"use client";

import type { Currency } from "@/lib/types";

interface HistoryTabProps {
  currency: Currency | null;
}

export default function HistoryTab({ currency: _ }: HistoryTabProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      History — coming in Section 05
    </div>
  );
}
