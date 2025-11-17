import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { env } from "../env";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
