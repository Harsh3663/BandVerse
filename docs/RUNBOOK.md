# BandVerse Operational Runbook

## Service outage

1. Check `/api/v1/health`, `/api/v1/ready`, `/api/v1/live`
2. Inspect recent deploy / error rate / latency metrics
3. Roll back last deploy if error spike correlates
4. Scale out Next.js instances if CPU/RPS saturated
5. Communicate SEV and ETA

## Payment outage

1. Confirm provider status (Razorpay/Stripe)
2. Freeze new intents if provider is down
3. Inspect `WebhookDelivery` failed rows
4. `POST /api/v1/payments/recover-webhooks`
5. Run job processor for `payment.reconcile`
6. Compare ledger captures vs provider settlements

## Database outage

1. Confirm managed Postgres status / failover
2. App circuit breaker will open — expect 5xx with limited retries
3. Fail over primary; update `DATABASE_URL` if needed
4. Validate connectivity via ready probe
5. Do not run destructive migrations during recovery

## Redis outage

1. App falls back to memory cache/rate-limit (single-instance semantics)
2. Provision replacement Redis; set `REDIS_URL`
3. Restart app pods
4. Warm search cache (`swrCache.warm` / natural SWR refill)
5. Re-enable multi-instance rate limiting expectations

## Webhook outage

1. Verify signature secrets and ingress reachability
2. Check provider retry queues
3. Recover failed deliveries via recover endpoint
4. Confirm idempotency keys prevent double capture
5. Notify finance if settlement window slips
