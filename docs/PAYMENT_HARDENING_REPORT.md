# Payment Hardening Report

## Providers

- **Razorpay / Stripe:** Live HTTP APIs when credentials present and `BANDVERSE_PAYMENT_SANDBOX≠true`
- **Sandbox:** Explicit sandbox intents (`rzp_sandbox_*` / `pi_sandbox_*`) with status **pending only**
- **Reconcile:** Never auto-marks paid; queries provider or returns pending
- **Webhooks:** Razorpay HMAC; Stripe `v1=` + timestamp tolerance; refund events → ledger `refund`
- **Idempotency:** `Idempotency-Key` header on live creates; durable `WebhookDelivery` keys
- **Ledger / settlement:** Existing ledger + settlement helpers retained

## Production guard

`assertProductionEnvironment` fails closed without live keys unless sandbox explicitly enabled.
