import type { Config } from "tailwindcss";
import baseConfig from "@studio/tailwind-config/tailwind.config.base";

const config: Config = {
  ...baseConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;
