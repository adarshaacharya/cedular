import type { NextConfig } from "next";

// Import env here to validate during build
import "./src/env";

const config: NextConfig = {
  // Enable Cache Components (opt-in caching)
  cacheComponents: true,

  // Turbopack is now default
  turbopack: {
    // Turbopack config if needed
  },

  reactCompiler: true,
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
};

export default config;
