# BandVerse Payment Architecture

## Providers

`PaymentProvider` interface with implementations:

- **Razorpay** — default for India (`PAYMENT_PROVIDER=razorpay`)
- **Stripe** — alternate international rails

Located in `web/src/backend/infrastructure/payments/`.

## Flow

1. Client calls `POST /api/v1/payments/intent` with booking, amount, kind, optional idempotency key.
2. Service derives idempotency key if missing (`bookingId:kind:amount` hash).
3. Provider creates intent (checkout URL / client secret).
4. Audit log written; booking process job enqueued.
5. Provider webhook hits `POST /api/v1/payments/webhook` with signature headers.
6. Signature verified (HMAC); duplicate idempotency keys short-circuit.
7. `payment.reconcile` job enqueued for async status sync.

## Security controls

- Webhook signature verification (Razorpay HMAC-SHA256, Stripe signed payload)
- Idempotency keys for intent + webhook processing
- Transaction audit trail via `AuditLog`
- RBAC: `payment:pay` / `payment:create` required for intents

## Reconciliation

`PaymentService.reconcile(providerReference)` + job handler `payment.reconcile`.

## Production checklist

- [ ] Set live Razorpay/Stripe secrets
- [ ] Persist webhook event table (currently in-memory dedupe set — replace with DB unique constraint)
- [ ] Map webhook status onto Prisma `Payment` rows
- [ ] Enable refunds + disputes playbooks
