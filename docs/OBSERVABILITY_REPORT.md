# Observability Report

- Request / correlation / trace IDs via `withRequestContext` + response headers
- Structured request completion logs
- Metrics: auth, payments, jobs, rate limits, cache, abuse, audit
- Ready/live/health probes; production ready fails on mock / missing DB / Redis down when configured
- Telemetry exporter stubs (OTEL/Grafana/Datadog/New Relic/Prometheus) unchanged
