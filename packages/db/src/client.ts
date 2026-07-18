import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";

const isProduction = process.env.NODE_ENV?.trim().toUpperCase() === "PRODUCTION";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 10),
});

// Never log raw SQL/params in production - it leaks patient/financial data.
const log: Prisma.LogLevel[] = isProduction
  ? ["warn", "error"]
  : ["query", "info", "warn", "error"];

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log,
  });

if (!isProduction) {
  globalForPrisma.prisma = db;
}
