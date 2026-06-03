"use client";

import { useState } from "react";
import { cn, getTextColour } from "@studio/utils";
import type { Colour } from "../lib/types";

interface LivePreviewProps {
  colours: Colour[];
}

type LayoutMode = "card" | "dashboard" | "landing";

const MODES: { value: LayoutMode; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "dashboard", label: "Dashboard" },
  { value: "landing", label: "Landing" },
];

function pickColour(colours: Colour[], ...usages: Colour["usage"][]): string {
  for (const u of usages) {
    const found = colours.find((c) => c.usage === u);
    if (found) return found.hex;
  }
  return colours[0]?.hex ?? "#f5f5f5";
}

function CardLayout({ colours }: { colours: Colour[] }) {
  const bg = pickColour(colours, "background", "surface");
  const surface = pickColour(colours, "surface", "card", "background");
  const primary = pickColour(colours, "primary", "accent");
  const accent = pickColour(colours, "accent", "highlight", "primary");
  const text = pickColour(colours, "text", "primary");

  const textOnBg = getTextColour(bg);
  const textOnSurface = getTextColour(surface);
  const textOnPrimary = getTextColour(primary);

  return (
    <div
      className="flex min-h-[260px] flex-col gap-4 rounded-xl p-5 transition-colors duration-300"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-md"
            style={{ backgroundColor: primary }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: textOnBg }}
          >
            Brand
          </span>
        </div>
        <div className="flex gap-1.5">
          {[bg, surface, primary].map((c, i) => (
            <div key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div
        className="flex-1 rounded-xl p-4 transition-colors duration-300"
        style={{ backgroundColor: surface }}
      >
        <div
          className="mb-1 text-[10px] uppercase tracking-widest"
          style={{ color: getTextColour(surface) + "80" }}
        >
          Headline
        </div>
        <div
          className="mb-3 text-base font-bold leading-snug"
          style={{ color: getTextColour(surface) }}
        >
          Make something beautiful
        </div>
        <div className="mb-4 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full"
              style={{
                backgroundColor: textOnSurface + "30",
                width: i === 0 ? "60%" : i === 1 ? "40%" : "50%",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-300"
            style={{ backgroundColor: primary, color: textOnPrimary }}
          >
            Get started
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-300"
            style={{
              borderColor: accent,
              color: accent,
              backgroundColor: "transparent",
            }}
          >
            Learn more
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {colours.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardLayout({ colours }: { colours: Colour[] }) {
  const bg = pickColour(colours, "background", "surface");
  const sidebar = pickColour(colours, "sidebar", "primary", "accent");
  const surface = pickColour(colours, "surface", "card", "background");
  const primary = pickColour(colours, "primary", "accent");
  const accent = pickColour(colours, "accent", "highlight", "primary");

  const textOnSidebar = getTextColour(sidebar);
  const textOnSurface = getTextColour(surface);
  const textOnPrimary = getTextColour(primary);

  const NAV_ITEMS = ["Overview", "Analytics", "Reports", "Settings"];

  return (
    <div
      className="flex min-h-[260px] overflow-hidden rounded-xl transition-colors duration-300"
      style={{ backgroundColor: bg }}
    >
      <div
        className="flex w-28 flex-shrink-0 flex-col gap-1 p-3 transition-colors duration-300"
        style={{ backgroundColor: sidebar }}
      >
        <div className="mb-3 flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: textOnSidebar + "40" }}
          />
          <span className="text-[10px] font-bold" style={{ color: textOnSidebar }}>
            Studio
          </span>
        </div>
        {NAV_ITEMS.map((item, i) => (
          <div
            key={item}
            className="rounded-md px-2 py-1 text-[9px] transition-colors duration-150"
            style={{
              backgroundColor: i === 0 ? textOnSidebar + "20" : "transparent",
              color: i === 0 ? textOnSidebar : textOnSidebar + "80",
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold"
            style={{ color: getTextColour(bg) }}
          >
            Overview
          </span>
          <button
            className="rounded-md px-2.5 py-1 text-[9px] font-medium transition-colors duration-300"
            style={{ backgroundColor: primary, color: textOnPrimary }}
          >
            Export
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[accent, primary].map((c, i) => (
            <div
              key={i}
              className="rounded-lg p-2.5 transition-colors duration-300"
              style={{ backgroundColor: surface }}
            >
              <div
                className="mb-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: c }}
              />
              <div
                className="text-xs font-bold"
                style={{ color: textOnSurface }}
              >
                {i === 0 ? "2,840" : "98.2%"}
              </div>
              <div
                className="text-[8px]"
                style={{ color: textOnSurface + "70" }}
              >
                {i === 0 ? "Users" : "Uptime"}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex flex-1 flex-col gap-1 rounded-lg p-2.5 transition-colors duration-300"
          style={{ backgroundColor: surface }}
        >
          <div
            className="mb-1 text-[8px] uppercase tracking-wider"
            style={{ color: textOnSurface + "60" }}
          >
            Activity
          </div>
          <div className="flex items-end gap-0.5 h-10">
            {[3, 6, 4, 8, 5, 7, 9, 5, 6, 8, 4, 7].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-colors duration-300"
                style={{
                  height: `${h * 10}%`,
                  backgroundColor: i === 10 ? primary : accent + "60",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingLayout({ colours }: { colours: Colour[] }) {
  const bg = pickColour(colours, "background", "surface");
  const primary = pickColour(colours, "primary", "accent");
  const accent = pickColour(colours, "accent", "highlight", "primary");
  const surface = pickColour(colours, "surface", "card", "background");
  const highlight = pickColour(colours, "highlight", "success", "accent");

  const textOnBg = getTextColour(bg);
  const textOnPrimary = getTextColour(primary);
  const textOnSurface = getTextColour(surface);

  return (
    <div
      className="flex min-h-[260px] flex-col transition-colors duration-300"
      style={{ backgroundColor: bg }}
    >
      <nav
        className="flex items-center justify-between border-b px-5 py-3 transition-colors duration-300"
        style={{
          borderColor: textOnBg + "15",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="h-5 w-5 rounded-md"
            style={{ backgroundColor: primary }}
          />
          <span className="text-[10px] font-bold" style={{ color: textOnBg }}>
            Product
          </span>
        </div>
        <div className="flex items-center gap-3">
          {["Pricing", "Docs", "Blog"].map((item) => (
            <span
              key={item}
              className="text-[9px]"
              style={{ color: textOnBg + "70" }}
            >
              {item}
            </span>
          ))}
        </div>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-4 text-center">
        <div
          className="rounded-full px-2.5 py-1 text-[9px] font-medium transition-colors duration-300"
          style={{ backgroundColor: highlight + "25", color: highlight }}
        >
          ✦ New — v2.0 is live
        </div>
        <div
          className="text-base font-extrabold leading-tight"
          style={{ color: textOnBg }}
        >
          Ship faster.<br />
          Look great.
        </div>
        <div
          className="max-w-[180px] text-[9px] leading-relaxed"
          style={{ color: textOnBg + "70" }}
        >
          The design system built for modern teams.
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg px-3 py-1.5 text-[9px] font-semibold transition-colors duration-300"
            style={{ backgroundColor: primary, color: textOnPrimary }}
          >
            Start free
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 text-[9px] font-semibold transition-colors duration-300"
            style={{ borderColor: accent, color: accent }}
          >
            See demo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: textOnBg + "10" }}>
        {["Fast", "Accessible", "Beautiful"].map((feature, i) => (
          <div
            key={feature}
            className="flex flex-col gap-1 p-3 transition-colors duration-300"
            style={{ backgroundColor: surface }}
          >
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: [primary, accent, highlight][i] }}
            />
            <span className="text-[9px] font-semibold" style={{ color: textOnSurface }}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LivePreview({ colours }: LivePreviewProps) {
  const [mode, setMode] = useState<LayoutMode>("card");

  if (colours.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Live preview
        </span>
        <div className="flex gap-1" role="radiogroup" aria-label="Preview layout">
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                mode === value
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {mode === "card" && <CardLayout colours={colours} />}
        {mode === "dashboard" && <DashboardLayout colours={colours} />}
        {mode === "landing" && <LandingLayout colours={colours} />}
      </div>
    </div>
  );
}
