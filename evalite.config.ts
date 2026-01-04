import { defineConfig } from "evalite/config";

export default defineConfig({
  // Run evals locally on port 3006
  server: {
    port: 3006,
  },

  // Timeout for each eval (30 seconds)
  testTimeout: 30000,

  // Maximum concurrency for running tests
  maxConcurrency: 5,

  // Minimum score threshold (fail if below this)
  scoreThreshold: 70,
});
