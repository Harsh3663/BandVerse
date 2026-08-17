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
  withRequestContext,
} from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { paginate, paginationQuerySchema } from "@/backend/shared/pagination";
import { entityIdSchema } from "@/backend/shared/validation/primitives";
import { reviewCreateSchema } from "@/backend/shared/validation/schemas";
import type { Review } from "@/modules/marketplace/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reviewQuerySchema = paginationQuerySchema.extend({
  performerId: entityIdSchema.optional(),
});

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const parsed = parseWithSchema(
    reviewQuerySchema,
    searchParamsToObject(new URL(request.url).searchParams),
  );
  if (!parsed.ok) {
    finish(400, "/api/v1/reviews");
    return jsonError(parsed.error, requestId);
  }

  const reviews = parsed.value.performerId
    ? await container.repositories.reviews.listByPerformer(parsed.value.performerId)
    : await container.repositories.reviews.list();
  const page = paginate(reviews, parsed.value);
  finish(200, "/api/v1/reviews");
  return jsonOk(page.items, { meta: page.meta, requestId });
}

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.REVIEW,
    PermissionAction.CREATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/reviews");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/reviews");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(reviewCreateSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/reviews");
    return jsonError(parsed.error, requestId);
  }

  const reviewAllowed = await container.lifecycle.assertReviewAllowed(
    parsed.value.bookingId,
  );
  if (!reviewAllowed) {
    finish(409, "/api/v1/reviews");
    return jsonError(
      {
        code: "CONFLICT",
        message: "Reviews are only allowed after a completed booking.",
        status: 409,
      },
      requestId,
    );
  }

  const review: Review = {
    id: `review_${crypto.randomUUID()}`,
    bookingId: parsed.value.bookingId,
    performerId: parsed.value.performerId,
    reviewerId: auth.value.userId,
    rating: parsed.value.rating,
    title: parsed.value.title,
    comment: parsed.value.comment,
    createdAt: new Date().toISOString(),
    verifiedBooking: true,
  };

  const repos = asWritableRepositories(container.repositories);
  const created = await repos.reviews.create(review);
  await writeAuditLog(container.prisma, {
    actorUserId: auth.value.userId,
    action: "create",
    resource: PermissionResource.REVIEW,
    resourceId: created.id,
    after: { rating: created.rating, performerId: created.performerId },
    ...clientMeta(request),
  });
  await container.eventBus.publish(
    "ReviewCreated",
    {
      reviewId: created.id,
      bookingId: created.bookingId,
      performerId: created.performerId,
      rating: created.rating,
    },
    requestId,
  );
  await container.swrCache.publishInvalidation(["reviews", "performers"]);
  finish(201, "/api/v1/reviews");
  return jsonOk(created, { status: 201, requestId });
}

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
