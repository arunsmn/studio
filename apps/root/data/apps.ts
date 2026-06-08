export interface AppEntry {
  slug: string;
  name: string;
  tagline: string;
  category: "app" | "tool" | "game";
  status: "live" | "coming-soon";
  url: string;
  color: string;
  icon: string;
  swatches?: string[];
}

export const APPS: AppEntry[] = [
  {
    slug: "palette-ai",
    name: "PaletteAI",
    tagline: "Describe a mood. Get a colour palette.",
    category: "tool",
    status: "live",
    url: "https://studio-palette-ai.vercel.app/",
    color: "bg-violet-100",
    icon: "Palette",
    swatches: ["#7C3AED", "#A78BFA", "#F472B6", "#FCD34D", "#34D399"],
  },
  {
    slug: "hisaab",
    name: "Hisaab",
    tagline: "Just say what you spent. Hisaab handles the rest.",
    category: "app",
    status: "live",
    url: "https://studio-hisaab.vercel.app/",
    color: "bg-emerald-100",
    icon: "Wallet",
    swatches: ["#ed8f0c"],
  },
];
