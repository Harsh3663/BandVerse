import { PermissionAction, PermissionResource } from "@/backend/domain/enums";
import { paymentIdempotencyKey } from "@/backend/infrastructure/payments";
import { requirePermission } from "@/backend/presentation/http/auth-guard";
import { parseJsonBody, parseWithSchema } from "@/backend/presentation/http/parse";
import { withRequestContext } from "@/backend/presentation/http/route-helpers";
import { jsonError, jsonOk } from "@/backend/presentation/http/response";
import { entityIdSchema, moneySchema } from "@/backend/shared/validation/primitives";
import { z } from "zod";

export const dynamic = "force-dynamic";

const intentSchema = z.object({
  bookingId: entityIdSchema,
  amount: moneySchema,
  kind: z.enum(["advance", "balance", "refund"]),
  customerEmail: z.string().email().optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request) {
  const { requestId, container, finish } = await withRequestContext(request);
  const auth = await requirePermission(
    request,
    PermissionResource.PAYMENT,
    PermissionAction.PAY,
  );
  if (!auth.ok) {
    finish(auth.error.status, "/api/v1/payments/intent");
    return jsonError(auth.error, requestId);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) {
    finish(400, "/api/v1/payments/intent");
    return jsonError(body.error, requestId);
  }
  const parsed = parseWithSchema(intentSchema, body.value);
  if (!parsed.ok) {
    finish(400, "/api/v1/payments/intent");
    return jsonError(parsed.error, requestId);
  }

  const intent = await container.payments.createIntent({
    ...parsed.value,
    idempotencyKey:
      parsed.value.idempotencyKey ??
      paymentIdempotencyKey({
        bookingId: parsed.value.bookingId,
        kind: parsed.value.kind,
        amount: parsed.value.amount.amount,
      }),
  });

  await container.queue.enqueue("booking.process", {
    bookingId: parsed.value.bookingId,
  });

  finish(201, "/api/v1/payments/intent");
  return jsonOk(intent, { status: 201, requestId });
}
