"use client";

import type { Currency } from "@/lib/types";

interface ChatTabProps {
  currency: Currency | null;
}

export default function ChatTab({ currency: _ }: ChatTabProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Chat — coming in Section 03
    </div>
  );
}
