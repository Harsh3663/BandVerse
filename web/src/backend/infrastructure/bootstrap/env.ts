import { logger } from "@/backend/infrastructure/observability/logger";

const PLACEHOLDERS = [
  "change-me",
  "bandverse-dev-only",
  "placeholder",
  "bandverse:bandverse",
];

function isWeak(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  return PLACEHOLDERS.some((p) => value.toLowerCase().includes(p));
}

/**
 * Fail closed in production when required secrets/deps are missing or weak.
 */
export function assertProductionEnvironment(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.BANDVERSE_SKIP_ENV_GUARD === "true") {
    logger.warn("BANDVERSE_SKIP_ENV_GUARD enabled — skipping production env checks");
    return;
  }

  const errors: string[] = [];
  if (isWeak(process.env.JWT_SECRET)) {
    errors.push("JWT_SECRET must be a strong non-placeholder secret");
  }
  if (!process.env.DATABASE_URL?.trim()) {
    errors.push("DATABASE_URL is required");
  }
  if (process.env.BANDVERSE_PERSISTENCE === "mock") {
    errors.push("BANDVERSE_PERSISTENCE=mock is not allowed in production");
  }
  if (
    process.env.PAYMENT_PROVIDER &&
    process.env.BANDVERSE_PAYMENT_SANDBOX !== "true"
  ) {
    const provider = process.env.PAYMENT_PROVIDER;
    if (provider === "razorpay") {
      if (isWeak(process.env.RAZORPAY_KEY_ID) || isWeak(process.env.RAZORPAY_KEY_SECRET)) {
        errors.push("Razorpay live keys required (or set BANDVERSE_PAYMENT_SANDBOX=true)");
      }
    }
    if (provider === "stripe") {
      if (isWeak(process.env.STRIPE_SECRET_KEY)) {
        errors.push("Stripe live key required (or set BANDVERSE_PAYMENT_SANDBOX=true)");
      }
    }
  }

  if (errors.length) {
    throw new Error(`Production environment invalid:\n- ${errors.join("\n- ")}`);
  }
}

export async function verifyRuntimeDependencies(options: {
  checkDatabase: () => Promise<boolean>;
  redisUrl?: string;
}): Promise<{ database: boolean; redis: boolean }> {
  const database = await options.checkDatabase();
  let redis = false;
  if (options.redisUrl?.trim()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis").default as new (url: string) => {
        ping(): Promise<string>;
        quit(): Promise<string>;
      };
      const client = new Redis(options.redisUrl);
      redis = (await client.ping()) === "PONG";
      await client.quit();
    } catch {
      redis = false;
    }
  }
  return { database, redis };
}
