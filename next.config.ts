import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

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

export default withWorkflow(config, {
  workflows: {
   // @ts-expect-error Workflow types are not compatible with Next.js 16
    dirs: ["src/workflows"],
  },
});
