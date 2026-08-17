# BandVerse Observability Guide

## Correlation IDs

- Edge middleware sets `x-request-id` / `x-correlation-id`.
- API `withRequestContext` reuses inbound IDs and attaches them to logs/responses.

## Structured logging

`logger` emits JSON lines with `service`, `timestamp`, `requestId`, route, status, duration.

## Metrics

`GET /api/v1/metrics` — Prometheus text format.

Counters include HTTP, auth, cache hit/miss/eviction, jobs, payments, realtime, security signals.

Histograms: `http_request_ms_*` latency buckets.

## Error tracking hooks

`captureErrorHook(error, context)` — set `globalThis.__BANDVERSE_ERROR_SINK__` to forward to Sentry/Datadog.

## Health probes

| Endpoint | Use |
|----------|-----|
| `/api/v1/live` | Liveness |
| `/api/v1/ready` | Readiness (DB when Prisma mode) |
| `/api/v1/health` | Service metadata |

## Business metrics

- bookings processed
- recommendations warmed
- analytics aggregated
- emails queued
- payments reconciled
