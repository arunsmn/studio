import type { AIModel } from "@studio/ai-core";

export interface Colour {
  hex: string;
  name: string;
  usage:
    | "background"
    | "surface"
    | "primary"
    | "accent"
    | "text"
    | "card"
    | "sidebar"
    | "highlight"
    | "success";
  rationale: string;
}

export interface PaletteOptions {
  mood: string;
  tone: "warm" | "cool" | "bold" | "muted" | "vibrant";
  useCase: "web-app" | "brand" | "presentation" | "social" | "print";
  audience:
    | "kids"
    | "professionals"
    | "gen-z"
    | "luxury"
    | "healthcare"
    | "everyone";
  theme: "light" | "dark" | "both";
  count: 3 | 5 | 6 | 8;
  model: AIModel;
}

export interface Palette {
  id: string;
  mood: string;
  colours: Colour[];
  model: AIModel;
  createdAt: number;
}
