import { listPerformersUseCase } from "@/backend/application/use-cases/performers";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { writeAuditLog } from "@/backend/infrastructure/observability/audit";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import {
  clientMeta,
  enforceRateLimit,
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError, jsonOk } from "@/backend/presentation/http/response";
import { performerQuerySchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";
import {
  entityIdSchema,
  handleSchema,
  moneySchema,
  stringListSchema,
} from "@/backend/shared/validation/primitives";
import type { PerformerProfile } from "@/modules/marketplace/types";

export const dynamic = "force-dynamic";

const performerCreateSchema = z.object({
  handle: handleSchema,
  kind: z.enum(["solo", "band", "traditional-group", "dj", "ensemble"]),
  displayName: z.string().trim().min(2).max(160),
  headline: z.string().trim().min(2).max(200),
  biography: z.string().trim().max(5000).default(""),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  categoryIds: stringListSchema.default([]),
  genreIds: stringListSchema.default([]),
  basePrice: moneySchema.optional(),
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/performers");
    return limited;
  }

  const parsed = parseWithSchema(
    performerQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/performers");
    return jsonError(parsed.error, requestId);
  }

  const result = await container.cache.remember(
    ["performers", "list", JSON.stringify(parsed.value)],
    () => listPerformersUseCase(container.repositories.performers, parsed.value),
    { ttlSeconds: 60, tags: ["performers"] },
  );
  if (!result.ok) {
    finish(result.error.status, "/api/v1/performers");
    return jsonError(result.error, requestId);
  }
  finish(200, "/api/v1/performers");
  return fromResult(
    { ok: true, value: result.value.items },
    { meta: result.value.meta, requestId },
  );
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PERFORMER,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/performers");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/performers");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(performerCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/performers");
    return jsonError(parsed.error, requestId);
  }

  const now = new Date().toISOString();
  const id = entityIdSchema.parse(`performer_${crypto.randomUUID()}`);
  const profile = {
    id,
    handle: parsed.value.handle,
    kind: parsed.value.kind,
    displayName: parsed.value.displayName,
    headline: parsed.value.headline,
    biography: parsed.value.biography,
    coverImage: { id: `${id}-cover`, kind: "image", source: "/placeholder.jpg", title: "Cover" },
    profilePhoto: {
      id: `${id}-photo`,
      kind: "image",
      source: "/placeholder.jpg",
      title: "Photo",
    },
    categoryIds: parsed.value.categoryIds,
    subcategoryIds: [],
    skillIds: [],
    instrumentIds: [],
    genreIds: parsed.value.genreIds,
    languageIds: ["en", "hi"],
    typicalPerformanceDurationMinutes: 90,
    supportedEventTypeIds: [],
    mediaGallery: [],
    videos: [],
    socialLinks: [],
    audioSamples: [],
    portfolioMedia: [],
    performanceHistory: [],
    socialProof: {
      followers: 0,
      repeatBookings: 0,
      responseRatePercent: 0,
      bookingSuccessPercent: 0,
      completionRatePercent: 0,
      yearsOfExperience: 0,
    },
    verification: {
      channels: [],
      verifiedPerformer: false,
    },
    experience: { years: 0, highlights: [] },
    pricingPackages: parsed.value.basePrice
      ? [
          {
            id: `${id}-pkg`,
            name: "Standard",
            description: "Standard performance package",
            price: parsed.value.basePrice,
            durationMinutes: 90,
            inclusions: [],
            negotiable: true,
          },
        ]
      : [],
    availability: {
      timezone: "Asia/Kolkata",
      weekly: [],
      blockedDates: [],
      minimumLeadDays: 7,
    },
    equipment: [],
    travel: {
      baseLocation: {
        city: parsed.value.city,
        state: parsed.value.state,
        countryCode: "IN",
      },
      radiusKm: 50,
      nationwide: false,
    },
    rating: { average: 0, count: 0 },
    awards: [],
    certificates: [],
    faqs: [],
    verified: false,
    trustSignals: { badges: [], cancellationPolicyId: "standard" },
    createdAt: now,
    updatedAt: now,
  } satisfies PerformerProfile;

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.performers.create(profile, auth.value.userId);
  await container.cache.invalidateTags(["performers", "search"]);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.PERFORMER,
    resourceId: created.id,
    ...clientMeta(request),
  });
  finish(201, "/api/v1/performers");
  return jsonOk(created, { status: 201, requestId });
}
