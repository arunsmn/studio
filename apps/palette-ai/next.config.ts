import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@studio/ui", "@studio/utils", "@studio/ai-core"],
};

export default config;
