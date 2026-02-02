import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // For PostgreSQL with Prisma Accelerate, migrations work directly with prisma+postgres://
    // No need for DIRECT_DATABASE_URL - Prisma Migrate supports prisma+postgres:// URLs
    url: env("DATABASE_URL"),
  },
});
