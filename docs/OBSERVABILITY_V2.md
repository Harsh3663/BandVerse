# BandVerse Observability V2

## Correlation model

| ID | Header | Source |
|----|--------|--------|
| Request ID | `x-request-id` | Client or generated `req_…` |
| Correlation / Trace ID | `x-correlation-id`, `x-trace-id` | Client or equals request ID |

Bound via AsyncLocalStorage (`enterTrace`) for the request chain. Responses echo IDs + `X-API-Version`.

## Structured business metrics

Existing counters plus enterprise additions:

- `domain_events_published_total`
- `audit_events_total`
- `ledger_entries_total`
- `abuse_blocked_total`
- `cache_swr_*`
- payment / auth counters from prior phase

Prometheus scrape: `/api/v1/metrics`

## Exporter preparation

`bootstrapTelemetryExporters()` prepares sinks for:

- OpenTelemetry (global hook `__BANDVERSE_OTEL_*`)
- Grafana
- Datadog
- New Relic
- Prometheus (pull)

No hard dependency on vendor SDKs; production images can wire exporters without changing route code.

## Audit + logs

Immutable audit events emit structured `audit.immutable` logs with hash + correlation ID.
