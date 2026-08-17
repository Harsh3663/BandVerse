import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { toLifecycleError } from "@/backend/presentation/http/lifecycle-errors";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { idParamSchema } from "@/backend/shared/validation/schemas";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  action: z.enum([
    "withdraw",
    "accept_invite",
    "reject_invite",
    "shortlist",
    "negotiate",
    "confirm",
    "advance_paid",
    "create_contract",
    "sign_contract",
    "upcoming",
    "complete",
    "cancel",
    "dispute",
    "balance_payment",
    "refund",
  ]),
  agreedPaise: z.number().int().positive().optional(),
  amountPaise: z.number().int().positive().optional(),
  reason: z.string().trim().max(1000).optional(),
  message: z.string().trim().max(2000).optional(),
  terms: z.string().trim().min(1).max(20_000).optional(),
  performanceDate: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
  feePaise: z.number().int().positive().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.BOOKING,
    PermissionAction.UPDATE,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/lifecycle/:id/actions");
    return jsonError(auth.error, requestId);
  }

  const params = await context.params;
  const parsedParams = parseWithSchema(idParamSchema, params);
  if (!parsedParams.ok) {
    finish(400, "/api/v1/lifecycle/:id/actions");
    return jsonError(parsedParams.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/lifecycle/:id/actions");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(schema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/lifecycle/:id/actions");
    return jsonError(parsed.error, requestId);
  }

  const lifecycleId = parsedParams.value.id;
  const actorUserId = auth.value.userId;

  try {
    let result: unknown;
    switch (parsed.value.action) {
      case "withdraw":
        result = await container.lifecycle.withdrawApplication({
          lifecycleId,
          actorUserId,
        });
        break;
      case "accept_invite":
        result = await container.lifecycle.acceptInvite({
          lifecycleId,
          actorUserId,
          message: parsed.value.message,
          quotedPaise: parsed.value.agreedPaise,
        });
        break;
      case "reject_invite":
        result = await container.lifecycle.rejectInvite({
          lifecycleId,
          actorUserId,
        });
        break;
      case "shortlist":
        result = await container.lifecycle.shortlist({ lifecycleId, actorUserId });
        break;
      case "negotiate":
        result = await container.lifecycle.startNegotiation({
          lifecycleId,
          actorUserId,
          agreedPaise: parsed.value.agreedPaise,
        });
        break;
      case "confirm":
        if (!parsed.value.agreedPaise) {
          throw Object.assign(new Error("agreedPaise is required."), {
            status: 400,
            code: "VALIDATION_ERROR",
          });
        }
        result = await container.lifecycle.confirm({
          lifecycleId,
          actorUserId,
          agreedPaise: parsed.value.agreedPaise,
        });
        break;
      case "advance_paid":
        result = await container.lifecycle.markAdvancePaid({
          lifecycleId,
          actorUserId,
          amountPaise: parsed.value.amountPaise ?? parsed.value.agreedPaise ?? 1,
        });
        break;
      case "create_contract":
        result = await container.lifecycle.createContract({
          lifecycleId,
          actorUserId,
          terms: parsed.value.terms ?? "Standard BandVerse performance terms.",
          performanceDate:
            parsed.value.performanceDate ?? new Date().toISOString(),
          durationMinutes: parsed.value.durationMinutes ?? 120,
          feePaise: parsed.value.feePaise ?? parsed.value.agreedPaise ?? 1,
        });
        break;
      case "sign_contract":
        result = await container.lifecycle.signContract({
          lifecycleId,
          actorUserId,
        });
        break;
      case "upcoming":
        result = await container.lifecycle.markUpcoming({
          lifecycleId,
          actorUserId,
        });
        break;
      case "complete":
        result = await container.lifecycle.complete({ lifecycleId, actorUserId });
        break;
      case "cancel":
        result = await container.lifecycle.cancel({
          lifecycleId,
          actorUserId,
          reason: parsed.value.reason,
        });
        break;
      case "dispute":
        result = await container.lifecycle.dispute({
          lifecycleId,
          actorUserId,
          reason: parsed.value.reason,
        });
        break;
      case "balance_payment":
        result = await container.lifecycle.recordBalancePayment({
          lifecycleId,
          actorUserId,
          amountPaise: parsed.value.amountPaise ?? 1,
        });
        break;
      case "refund":
        result = await container.lifecycle.refund({
          lifecycleId,
          actorUserId,
          amountPaise: parsed.value.amountPaise ?? 1,
        });
        break;
      default:
        throw Object.assign(new Error("Unknown action."), {
          status: 400,
          code: "VALIDATION_ERROR",
        });
    }

    finish(200, "/api/v1/lifecycle/:id/actions");
    return jsonOk(result, { requestId });
  } catch (error) {
    const appError = toLifecycleError(error);
    finish(appError.status, "/api/v1/lifecycle/:id/actions");
    return jsonError(appError, requestId);
  }
}
