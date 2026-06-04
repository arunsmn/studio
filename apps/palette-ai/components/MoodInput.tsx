"use client";

import { useState, useEffect, useRef } from "react";
import { Button, PillChip, ModelToggle } from "@studio/ui";
import { cn } from "@studio/utils";
import { ImageIcon, Loader2 } from "lucide-react";
import type { AIModel } from "@studio/ai-core";
import type { PaletteOptions } from "../lib/types";

interface MoodInputProps {
  onGenerate: (options: PaletteOptions) => void;
  onGenerateFromImage: (file: File, count: 3 | 5 | 6 | 8, model: AIModel) => void;
  isLoading: boolean;
  cooldown: number;
}

const STORAGE_KEY = "studio:preferred-model";

const EXAMPLE_MOODS = [
  "rainy monday",
  "summer festival",
  "minimal office",
  "golden hour",
  "neon city",
];

const TONES: PaletteOptions["tone"][] = [
  "warm",
  "cool",
  "bold",
  "muted",
  "vibrant",
];

const USE_CASES: { value: PaletteOptions["useCase"]; label: string }[] = [
  { value: "web-app", label: "web app" },
  { value: "brand", label: "brand" },
  { value: "presentation", label: "presentation" },
  { value: "social", label: "social" },
  { value: "print", label: "print" },
];

const AUDIENCES: { value: PaletteOptions["audience"]; label: string }[] = [
  { value: "kids", label: "kids" },
  { value: "professionals", label: "professionals" },
  { value: "gen-z", label: "gen Z" },
  { value: "luxury", label: "luxury" },
  { value: "healthcare", label: "healthcare" },
  { value: "everyone", label: "everyone" },
];

const THEMES: PaletteOptions["theme"][] = ["light", "dark", "both"];
const COUNTS: PaletteOptions["count"][] = [3, 5, 6, 8];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
      {children}
    </span>
  );
}

export function MoodInput({
  onGenerate,
  onGenerateFromImage,
  isLoading,
  cooldown,
}: MoodInputProps) {
  const [mood, setMood] = useState("");
  const [tone, setTone] = useState<PaletteOptions["tone"]>("warm");
  const [useCase, setUseCase] = useState<PaletteOptions["useCase"]>("web-app");
  const [audience, setAudience] =
    useState<PaletteOptions["audience"]>("professionals");
  const [theme, setTheme] = useState<PaletteOptions["theme"]>("light");
  const [count, setCount] = useState<PaletteOptions["count"]>(5);
  const [model, setModel] = useState<AIModel>("gemini");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "claude") setModel("claude");
  }, []);

  const isDisabled = isLoading || cooldown > 0 || mood.trim().length < 2;

  function handleGenerate() {
    if (isDisabled) return;
    onGenerate({
      mood: mood.trim(),
      tone,
      useCase,
      audience,
      theme,
      count,
      model,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    onGenerateFromImage(file, count, model);
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <SectionLabel>describe a mood or upload a photo</SectionLabel>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {EXAMPLE_MOODS.map((example) => (
            <button
              key={example}
              onClick={() => setMood(example)}
              className={cn(
                "rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition-colors duration-150",
                "hover:border-gray-400 hover:text-gray-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                "dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300",
              )}
            >
              {example}
            </button>
          ))}
        </div>
        <div className="relative">
          <textarea
            value={mood}
            onChange={(e) => setMood(e.target.value.slice(0, 200))}
            onKeyDown={handleKeyDown}
            placeholder="Describe a mood, feeling, or scene…"
            rows={3}
            className={cn(
              "w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-violet-500",
              "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-500",
            )}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-400">
            {mood.length}/200
          </span>
        </div>

        <div className="relative my-3 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload image for palette generation"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Upload an image to extract a palette"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm transition-colors duration-150",
              "border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              "dark:border-gray-600 dark:text-gray-400 dark:hover:border-violet-500 dark:hover:text-violet-400 dark:hover:bg-violet-950/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Upload a photo to extract colours</span>
          </button>

          {imagePreview && isLoading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={imagePreview}
                  alt="Uploaded image preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Extracting palette from image…
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <SectionLabel>tone</SectionLabel>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Tone"
        >
          {TONES.map((t) => (
            <PillChip
              key={t}
              label={t}
              selected={tone === t}
              onClick={() => setTone(t)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>use case</SectionLabel>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Use case"
        >
          {USE_CASES.map(({ value, label }) => (
            <PillChip
              key={value}
              label={label}
              selected={useCase === value}
              onClick={() => setUseCase(value)}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>audience</SectionLabel>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Audience"
        >
          {AUDIENCES.map(({ value, label }) => (
            <PillChip
              key={value}
              label={label}
              selected={audience === value}
              onClick={() => setAudience(value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div>
          <SectionLabel>theme</SectionLabel>
          <div className="flex gap-2" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <PillChip
                key={t}
                label={t}
                selected={theme === t}
                onClick={() => setTheme(t)}
              />
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>colours</SectionLabel>
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-label="Colour count"
          >
            {COUNTS.map((c) => (
              <PillChip
                key={c}
                label={String(c)}
                selected={count === c}
                onClick={() => setCount(c)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <ModelToggle value={model} onChange={setModel} />
        <Button
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isDisabled}
          onClick={handleGenerate}
        >
          {cooldown > 0 ? `Wait ${cooldown}s` : "Generate"}
        </Button>
      </div>
    </div>
  );
}
