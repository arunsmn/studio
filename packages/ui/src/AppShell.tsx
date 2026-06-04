"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface AppShellProps {
  title: string;
  studioHref?: string;
  backHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, studioHref = "/", backHref, actions, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link
            href={studioHref}
            className="text-sm font-semibold text-gray-900 transition-colors hover:text-violet-600 dark:text-gray-50 dark:hover:text-violet-400"
          >
            Studio
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </span>
          {(backHref || actions) && (
            <div className="ml-auto flex items-center gap-2">
              {actions}
              {backHref && (
                <Link
                  href={backHref}
                  aria-label="Go back"
                  className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Link>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
