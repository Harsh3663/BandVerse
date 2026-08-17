# BandVerse Payment Reliability

## Hardening layers

1. **Idempotent webhooks** — durable `WebhookDelivery` (Prisma) or process set (mock)
2. **Ledger model** — append-only `LedgerEntry` for authorization/capture/refund/settlement
3. **Settlement tracking** — `Payment.settlementStatus` + `settledAt`
4. **Reconciliation jobs** — `payment.reconcile` via existing queue/job ports
5. **Failed webhook recovery** — `POST /api/v1/payments/recover-webhooks`
6. **Domain event** — `PaymentCompleted` after successful capture

## Ledger entry types

`authorization` | `capture` | `refund` | `settlement` | `adjustment`

Amounts stored in paise with debit/credit direction.

## Recovery playbook

1. Confirm provider dashboard vs BandVerse ledger
2. Call recover-webhooks for `failed` deliveries (attempts < 8)
3. Job worker runs `payment.reconcile`
4. Mark settled via reliability service when provider confirms capture
5. Audit trail: `payment.intent_created`, `payment.webhook`, `ledger.write`

## Providers

Existing Razorpay/Stripe provider interfaces unchanged; reliability wraps them.
