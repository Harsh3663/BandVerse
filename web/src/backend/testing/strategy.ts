/**
 * BandVerse testing strategy (unit / integration / e2e / performance).
 */

export const testingStrategy = {
  unit: {
    framework: "Vitest (to be added)",
    scope: [
      "state-machines transitions",
      "filters / compatibility / recommendations scoring",
      "Zod validation schemas",
      "RBAC/ABAC authorization decisions",
      "pagination helpers",
      "use-case pure branching (not found, invalid transition)",
    ],
    location: "web/src/**/*.test.ts",
    targetCoverage: {
      domain: 90,
      application: 80,
      shared: 90,
    },
  },
  integration: {
    framework: "Vitest + Next route handler invocation",
    scope: [
      "API routes with mockPlatformRepositories",
      "repository adapters",
      "auth login/refresh stub flows",
      "rate limiter behavior",
    ],
    location: "web/src/backend/**/*.integration.test.ts",
  },
  repository: {
    whenPrismaEnabled: [
      "Use testcontainers PostgreSQL",
      "Verify unique constraints and soft-delete filters",
      "Verify composite index-backed query plans for hot paths",
    ],
  },
  service: {
    scope: [
      "RecommendationService vs marketplace getRecommendations parity",
      "AnalyticsService parity with dashboard analytics helpers",
      "MediaSecurityService accept/reject matrix",
    ],
  },
  api: {
    scope: [
      "Contract tests for /api/v1/* success + error envelopes",
      "Pagination meta correctness",
      "Validation 400 payloads",
      "Auth 401 / rate limit 429",
    ],
  },
  e2e: {
    framework: "Playwright (existing)",
    existingSpec: "web/tests/public-experience.spec.ts",
    additions: [
      "API health smoke",
      "Booking lifecycle happy path against mock API",
      "Organizer application triage",
      "Auth demo login still works for UI",
    ],
  },
  performance: {
    tools: ["k6", "Playwright trace", "Next bundle analyzer"],
    budgets: {
      apiP95Ms: 200,
      recommendationP95Ms: 400,
      lcpLandingMs: 2500,
      jsBundleInitialKb: 350,
    },
  },
  load: {
    scenarios: [
      {
        name: "discovery-read",
        vus: 100,
        duration: "5m",
        endpoints: ["GET /api/v1/performers", "GET /api/v1/events"],
      },
      {
        name: "recommendation-burst",
        vus: 50,
        duration: "3m",
        endpoints: ["POST /api/v1/recommendations"],
      },
      {
        name: "booking-write",
        vus: 30,
        duration: "5m",
        endpoints: ["POST /api/v1/bookings", "POST /api/v1/applications"],
      },
    ],
    successCriteria: [
      "error rate < 1%",
      "p95 within budgets",
      "no memory leak in rate-limiter map under sustained load (replace with Redis before prod)",
    ],
  },
} as const;
