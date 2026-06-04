import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@studio/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@studio/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      "@studio/ai-core": path.resolve(__dirname, "../../packages/ai-core/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
  },
});
