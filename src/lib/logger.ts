import pino from "pino";
import { env } from "@/env";

/**
 * Pino logger configuration
 *
 * In development: Uses pino-pretty for human-readable logs
 * In production: Uses JSON format for structured logging
 */
const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            singleLine: false,
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: env.NODE_ENV,
  },
});

export default logger;
