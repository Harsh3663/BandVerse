import { listVenuesUseCase } from "@/backend/application/use-cases/venues";
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
import {
  venueCreateSchema,
  venueQuerySchema,
} from "@/backend/shared/validation/schemas";
import type { VenueProfile } from "@/modules/marketplace/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const limited = await enforceRateLimit(request, "publicRead", requestId);
  if (limited) {
    finish(429, "/api/v1/venues");
    return limited;
  }

  const parsed = parseWithSchema(
    venueQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/venues");
    return jsonError(parsed.error, requestId);
  }

  const result = await listVenuesUseCase(container.repositories.venues, parsed.value);
  if (!result.ok) {
    finish(result.error.status, "/api/v1/venues");
    return jsonError(result.error, requestId);
  }
  finish(200, "/api/v1/venues");
  return fromResult(
    { ok: true, value: result.value.items },
    { meta: result.value.meta, requestId },
  );
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.VENUE,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/venues");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/venues");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(venueCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/venues");
    return jsonError(parsed.error, requestId);
  }

  const profile: VenueProfile = {
    id: `venue_${crypto.randomUUID()}`,
    handle: parsed.value.handle,
    name: parsed.value.name,
    type: parsed.value.type,
    description: parsed.value.description,
    location: parsed.value.location,
    capacity: parsed.value.capacity,
    amenityIds: parsed.value.amenityIds,
    preferredGenreIds: parsed.value.preferredGenreIds,
    preferredEventTypeIds: parsed.value.preferredEventTypeIds,
    mediaGallery: [],
    recurringSchedules: [],
    contact: {
      name: auth.value.userId,
      email: "venue@bandverse.in",
    },
    verified: false,
    trustSignals: { badges: [], cancellationPolicyId: "standard" },
  };

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.venues.create(profile, auth.value.userId);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.VENUE,
    resourceId: created.id,
    ...clientMeta(request),
  });
  finish(201, "/api/v1/venues");
  return jsonOk(created, { status: 201, requestId });
}
