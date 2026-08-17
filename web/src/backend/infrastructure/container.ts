import { createAuthorizationService } from "./security/rbac";
import { createMediaSecurityService } from "./security/media";
import { createMemoryAuthService } from "./security/auth-service";
import { createMemoryMfaService, createPrismaMfaService, type MfaService } from "./security/mfa";
import {
  createMemorySessionService,
  createPrismaSessionService,
  type SessionService,
} from "./security/sessions";
import { createRateLimitServiceSync } from "./security/redis-rate-limit";
import { createMockPlatformRepositories } from "./persistence/mock/platform-repositories";
import { isDatabaseConfigured } from "./persistence/prisma/client";
import { createCacheServiceSync, type CacheService } from "./cache/cache-service";
import { createSwrCache } from "./cache/swr-cache";
import { createMemoryJobSystem, registerDefaultJobHandlers } from "./jobs";
import type { JobPort, QueuePort, SchedulerPort } from "./jobs";
import { createPaymentService, type PaymentService } from "./payments";
import {
  createInProcessRealtimeGateway,
  createNotificationService,
} from "./realtime/gateway";
import type { NotificationService, RealtimeGateway } from "./realtime/ports";
import { createSearchService, type SearchService } from "@/backend/application/services/search-service";
import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { AuthService, RateLimitService } from "@/backend/application/ports/services";
import { createInProcessEventBus, type EventBus } from "./events/event-bus";
import { createRetentionService, type RetentionService } from "./retention/retention";
import { bootstrapTelemetryExporters, type TelemetryExporter } from "./observability/exporters";
import { assertProductionEnvironment } from "./bootstrap/env";
import {
  createLifecycleService,
  type LifecycleService,
} from "./lifecycle/lifecycle-service";
import {
  createPortfolioService,
  type PortfolioService,
} from "./portfolio/portfolio-service";
import {
  createMessagingService,
  type MessagingService,
} from "./messaging/messaging-service";
import {
  createVenueEcosystemService,
  type VenueEcosystemService,
} from "./venues/venue-ecosystem-service";
import {
  createMatchingService,
  type MatchingService,
} from "./matching/matching-service";
import {
  createEventPlanningService,
  type EventPlanningService,
} from "./event-planning/event-planning-service";

export type PersistenceMode = "prisma" | "mock";

export interface BackendContainer {
  readonly repositories: PlatformRepositories;
  readonly auth: AuthService;
  readonly authorization: ReturnType<typeof createAuthorizationService>;
  readonly rateLimit: RateLimitService;
  readonly mediaSecurity: ReturnType<typeof createMediaSecurityService>;
  readonly mode: PersistenceMode;
  readonly prisma?: import("@prisma/client").PrismaClient;
  readonly cache: CacheService;
  readonly swrCache: ReturnType<typeof createSwrCache>;
  readonly queue: QueuePort;
  readonly jobs: JobPort;
  readonly scheduler: SchedulerPort;
  readonly payments: PaymentService;
  readonly realtime: RealtimeGateway;
  readonly notifications: NotificationService;
  readonly search: SearchService;
  readonly mfa: MfaService;
  readonly sessions: SessionService;
  readonly eventBus: EventBus;
  readonly retention: RetentionService;
  readonly telemetry: readonly TelemetryExporter[];
  readonly lifecycle: LifecycleService;
  readonly portfolio: PortfolioService;
  readonly messaging: MessagingService;
  readonly venueEcosystem: VenueEcosystemService;
  readonly matching: MatchingService;
  readonly eventPlanning: EventPlanningService;
}

function attachPlatformServices(
  base: Omit<
    BackendContainer,
    | "cache"
    | "swrCache"
    | "queue"
    | "jobs"
    | "scheduler"
    | "payments"
    | "realtime"
    | "notifications"
    | "search"
    | "mfa"
    | "sessions"
    | "eventBus"
    | "retention"
    | "telemetry"
    | "lifecycle"
    | "portfolio"
    | "messaging"
    | "venueEcosystem"
    | "matching"
    | "eventPlanning"
  > & {
    mfa?: MfaService;
    sessions?: SessionService;
  },
): BackendContainer {
  const cache = createCacheServiceSync();
  const eventBus = createInProcessEventBus();
  const swrCache = createSwrCache(cache, eventBus);
  const memoryJobs = createMemoryJobSystem();
  let queue: QueuePort = memoryJobs.queue;
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Queue } = require("bullmq") as {
        Queue: new (
          name: string,
          opts: { connection: { url: string } },
        ) => {
          add: (
            name: string,
            data: unknown,
            opts?: {
              delay?: number;
              attempts?: number;
              backoff?: { type: string; delay: number };
            },
          ) => Promise<{ id?: string }>;
          count: () => Promise<number>;
        };
      };
      const bull = new Queue("bandverse", { connection: { url: redisUrl } });
      const dlq = new Queue("bandverse-dlq", { connection: { url: redisUrl } });
      queue = {
        async enqueue(name, payload, options) {
          try {
            const result = await bull.add(name, payload, {
              delay: options?.delayMs,
              attempts: options?.maxAttempts ?? 5,
              backoff: { type: "exponential", delay: 1_000 },
            });
            return {
              id: String(result.id ?? `${name}-${Date.now()}`),
              name,
              payload,
              attempts: 0,
              maxAttempts: options?.maxAttempts ?? 5,
              availableAt: Date.now() + (options?.delayMs ?? 0),
              createdAt: Date.now(),
            };
          } catch (error) {
            await dlq.add(`dlq:${name}`, {
              payload,
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          }
        },
        async size() {
          return bull.count();
        },
      };
    } catch {
      queue = memoryJobs.queue;
    }
  }
  registerDefaultJobHandlers(memoryJobs.jobs, queue);
  const realtime = createInProcessRealtimeGateway();
  const notifications = createNotificationService({
    realtime,
    queue,
  });
  const payments = createPaymentService({
    queue,
    prisma: base.prisma,
    eventBus,
  });
  const lifecycle = createLifecycleService({
    repositories: base.repositories,
    queue,
    payments,
  });
  const portfolio = createPortfolioService({
    repositories: base.repositories,
    lifecycle,
    mediaSecurity: base.mediaSecurity,
  });
  const messaging = createMessagingService({
    realtime,
    notifications,
    queue,
    mediaSecurity: base.mediaSecurity,
  });
  const venueEcosystem = createVenueEcosystemService({
    repositories: base.repositories,
    lifecycle,
    mediaSecurity: base.mediaSecurity,
  });
  const matching = createMatchingService({
    repositories: base.repositories,
    portfolio,
  });
  const eventPlanning = createEventPlanningService({
    repositories: base.repositories,
    matching,
  });
  const search = createSearchService(base.repositories, cache, swrCache, {
    getDiscoveryBoost: (performerId) =>
      portfolio.getDiscoveryScore(performerId).then((s) => s.total),
  });
  const mfa = base.mfa ?? createMemoryMfaService();
  const sessions = base.sessions ?? createMemorySessionService();
  const retention = createRetentionService(base.prisma);
  const telemetry = bootstrapTelemetryExporters();

  eventBus.subscribe("PaymentCompleted", async (event) => {
    await notifications.notify({
      userId: String(event.payload.userId ?? "system"),
      title: "Payment completed",
      body: `Payment ${String(event.payload.providerReference ?? "")} completed.`,
      channel: "in_app",
    });
  });

  return {
    ...base,
    cache,
    swrCache,
    queue,
    jobs: memoryJobs.jobs,
    scheduler: memoryJobs.scheduler,
    payments,
    realtime,
    notifications,
    search,
    mfa,
    sessions,
    eventBus,
    retention,
    telemetry,
    lifecycle,
    portfolio,
    messaging,
    venueEcosystem,
    matching,
    eventPlanning,
  };
}

export function createBackendContainer(): BackendContainer {
  assertProductionEnvironment();
  const forceMock = process.env.BANDVERSE_PERSISTENCE === "mock";
  const usePrisma = !forceMock && isDatabaseConfigured();

  if (usePrisma) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { getPrismaClient } =
      require("./persistence/prisma/client") as typeof import("./persistence/prisma/client");
    const { createPrismaPlatformRepositories } =
      require("./persistence/prisma/repositories") as typeof import("./persistence/prisma/repositories");
    const { createPrismaAuthService } =
      require("./security/auth-service") as typeof import("./security/auth-service");
    /* eslint-enable @typescript-eslint/no-require-imports */

    const prisma = getPrismaClient();
    return attachPlatformServices({
      repositories: createPrismaPlatformRepositories(prisma),
      auth: createPrismaAuthService(prisma),
      authorization: createAuthorizationService(),
      rateLimit: createRateLimitServiceSync(),
      mediaSecurity: createMediaSecurityService(),
      mode: "prisma",
      prisma,
      mfa: createPrismaMfaService(prisma),
      sessions: createPrismaSessionService(prisma),
    });
  }

  const memorySessions = createMemorySessionService();
  const memoryMfa = createMemoryMfaService();
  return attachPlatformServices({
    repositories: createMockPlatformRepositories(),
    auth: createMemoryAuthService({
      onSessionCreated: (session) => {
        memorySessions.upsert({
          id: session.id,
          userId: session.userId,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          lastSeenAt: session.createdAt,
        });
      },
      isMfaEnabled: async (userId) => (await memoryMfa.getStatus(userId)).enabled,
    }),
    authorization: createAuthorizationService(),
    rateLimit: createRateLimitServiceSync(),
    mediaSecurity: createMediaSecurityService(),
    mode: "mock",
    sessions: memorySessions,
    mfa: memoryMfa,
  });
}

let singleton: BackendContainer | undefined;

export function getBackendContainer(): BackendContainer {
  singleton ??= createBackendContainer();
  return singleton;
}

export function resetBackendContainer(): void {
  singleton = undefined;
}
