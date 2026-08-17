import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toPortfolioError } from "@/backend/presentation/http/portfolio-errors";
import {
  parseJsonBody,
  parseWithSchema,
  searchParamsToObject,
} from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { availabilityUpsertSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  ownerType: z.enum(["performer", "venue", "host"]).default("performer"),
  ownerId: entityIdSchema,
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsed = parseWithSchema(
    listSchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/availability");
    return jsonError(parsed.error, requestId);
  }

  const now = new Date();
  const year = parsed.value.year ?? now.getUTCFullYear();
  const month = parsed.value.month ?? now.getUTCMonth() + 1;

  if (parsed.value.ownerType !== "performer") {
    const entries = await container.repositories.calendar.listByOwner(
      parsed.value.ownerType,
      parsed.value.ownerId,
    );
    finish(200, "/api/v1/availability");
    return jsonOk({ ownerType: parsed.value.ownerType, entries }, { requestId });
  }

  try {
    const monthView = await container.portfolio.getMonth({
      performerId: parsed.value.ownerId,
      year,
      month,
    });
    finish(200, "/api/v1/availability");
    return jsonOk(monthView, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/availability");
    return jsonError(appError, requestId);
  }
}

export async function PUT(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.AVAILABILITY,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/availability");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/availability");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(availabilityUpsertSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/availability");
    return jsonError(parsed.error, requestId);
  }

  if (parsed.value.ownerType !== "performer") {
    finish(400, "/api/v1/availability");
    return jsonError(
      {
        code: "VALIDATION_ERROR",
        message: "Use portfolio availability for performer calendars; venue/host slot upsert via calendar repo is not wired in this endpoint.",
        status: 400,
      },
      requestId,
    );
  }

  try {
    const status =
      parsed.value.status === "holiday" || parsed.value.status === "travel"
        ? "blocked"
        : parsed.value.status === "available" ||
            parsed.value.status === "tentative" ||
            parsed.value.status === "booked" ||
            parsed.value.status === "blocked"
          ? parsed.value.status
          : "blocked";

    const day = await container.portfolio.upsertAvailabilityDay({
      performerId: parsed.value.ownerId,
      date: parsed.value.startsAt.slice(0, 10),
      status,
      relatedLifecycleId: parsed.value.relatedBookingId,
    });
    finish(200, "/api/v1/availability");
    return jsonOk(day, { requestId });
  } catch (error) {
    const appError = toPortfolioError(error);
    finish(appError.status, "/api/v1/availability");
    return jsonError(appError, requestId);
  }
}
