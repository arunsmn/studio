import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  darkMode: "class",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
