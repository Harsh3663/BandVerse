import {
  dbCircuitBreaker,
  withRetry,
} from "@/backend/infrastructure/persistence/prisma/resilience";

type PrismaClient = import("@prisma/client").PrismaClient;

const globalForPrisma = globalThis as unknown as {
  bandversePrisma?: PrismaClient;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPrismaClient(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not configured. Set DATABASE_URL to enable Prisma persistence.",
    );
  }

  if (!globalForPrisma.bandversePrisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
    globalForPrisma.bandversePrisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }

  return globalForPrisma.bandversePrisma;
}

export async function checkDatabaseConnectivity(): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await dbCircuitBreaker.exec(() =>
      withRetry(() => getPrismaClient().$queryRaw`SELECT 1`, { retries: 2 }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function withDbResilience<T>(fn: () => Promise<T>): Promise<T> {
  return dbCircuitBreaker.exec(() => withRetry(fn));
}
