export interface AppEntry {
  slug: string;
  name: string;
  tagline: string;
  category: "app" | "tool" | "game";
  status: "live" | "coming-soon";
  url: string;
  color: string;
  icon: string;
}

export const APPS: AppEntry[] = [
  {
    slug: "palette-ai",
    name: "PaletteAI",
    tagline: "Describe a mood. Get a colour palette.",
    category: "tool",
    status: "coming-soon",
    url: "https://studio-palette-ai.vercel.app/",
    color: "bg-violet-100",
    icon: "Palette",
  },
];
