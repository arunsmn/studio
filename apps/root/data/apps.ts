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
];
