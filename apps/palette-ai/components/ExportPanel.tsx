"use client";

import { useState } from "react";
import { cn, hexToHSL } from "@studio/utils";
import { CopyButton } from "@studio/ui";
import type { Colour } from "../lib/types";

interface ExportPanelProps {
  colours: Colour[];
}

type ExportTab = "css" | "tailwind" | "json";

const TABS: { value: ExportTab; label: string }[] = [
  { value: "css", label: "CSS" },
  { value: "tailwind", label: "Tailwind" },
  { value: "json", label: "JSON" },
];

function toCssVarName(name: string): string {
  return "--color-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function toTailwindKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function buildCss(colours: Colour[]): string {
  const vars = colours
    .map((c) => `  ${toCssVarName(c.name)}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function buildCssHsl(colours: Colour[]): string {
  const vars = colours
    .map((c) => `  ${toCssVarName(c.name)}: hsl(${hexToHSL(c.hex)});`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

function buildTailwind(colours: Colour[]): string {
  const entries = colours
    .map((c) => `      "${toTailwindKey(c.name)}": "${c.hex}",`)
    .join("\n");
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      },\n    },\n  },\n};`;
}

function buildJson(colours: Colour[]): string {
  return JSON.stringify(
    colours.map((c) => ({
      name: c.name,
      hex: c.hex,
      usage: c.usage,
      hsl: `hsl(${hexToHSL(c.hex)})`,
    })),
    null,
    2
  );
}

export function ExportPanel({ colours }: ExportPanelProps) {
  const [tab, setTab] = useState<ExportTab>("css");
  const [variant, setVariant] = useState<"hex" | "hsl">("hex");

  if (colours.length === 0) return null;

  const cssCode = variant === "hex" ? buildCss(colours) : buildCssHsl(colours);
  const tailwindCode = buildTailwind(colours);
  const jsonCode = buildJson(colours);

  const activeCode =
    tab === "css" ? cssCode : tab === "tailwind" ? tailwindCode : jsonCode;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
        Export
      </span>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1" role="tablist">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  tab === value
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "css" && (
            <div className="flex gap-1">
              {(["hex", "hsl"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    variant === v
                      ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <pre
            className="overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800 dark:bg-gray-950 dark:text-gray-200"
            role="region"
            aria-label={`${tab} export code`}
          >
            {activeCode}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton value={activeCode} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
