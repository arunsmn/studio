"use client";

import type { Currency } from "@/lib/types";

interface SummaryTabProps {
  currency: Currency | null;
}

export default function SummaryTab({ currency: _ }: SummaryTabProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Summary — coming in Section 04
    </div>
  );
}
