import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The route indicator was observed rendering under `next start`; keep it off
  // so it can never appear for customers.
  devIndicators: false,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
