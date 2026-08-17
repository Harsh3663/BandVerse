import { getOrganizerAnalyticsUseCase } from "@/backend/application/use-cases/analytics";
import { defaultCacheTtl } from "@/backend/infrastructure/cache";
import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { fromResult, jsonError } from "@/backend/presentation/http/response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.ANALYTICS,
    PermissionAction.READ,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/analytics/dashboard");
    return jsonError(auth.error, requestId);
  }

  const result = await container.cache.remember(
    ["analytics", "dashboard", auth.value.userId],
    () => getOrganizerAnalyticsUseCase(container.repositories),
    { ttlSeconds: defaultCacheTtl.analytics, tags: ["analytics"] },
  );

  await container.queue.enqueue("analytics.aggregate", {
    subjectType: "organizer",
    subjectId: auth.value.userId,
  });

  finish(result.ok ? 200 : result.error.status, "/api/v1/analytics/dashboard");
  return fromResult(result, { requestId });
}
