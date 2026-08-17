# BandVerse API Governance

## Versioning

- Current surface: `/api/v1/*`
- Response header: `X-API-Version: v1`
- Breaking changes require `/api/v2` and dual-run window

## Deprecation

When retiring an endpoint/field:

1. Set `Deprecation: true`
2. Set `Sunset: <HTTP-date>`
3. Document in release notes ≥ 90 days before removal
4. Keep contract tests green for both versions during overlap

Helpers: `applyVersionHeaders(headers, { deprecated, sunset })`

## Throttling policies

| Policy | Limit / window |
|--------|----------------|
| publicRead | 120 / min |
| auth | 20 / min |
| write | 60 / min |
| search | 90 / min |
| webhook | 300 / min |

Enforced via `enforceRateLimit` + existing rate-limit service (Redis-capable cache layer for multi-instance).

## Payload limits

| Class | Max bytes |
|-------|-----------|
| JSON default | 1 MiB |
| Auth JSON | 64 KiB |
| Webhooks | 2 MiB |

`parseJsonBody` rejects oversized `Content-Length`.

## Abuse detection

`recordAbuseSignal` / `isAbusive` accumulate 4xx/auth failures per IP. Score ≥ 20 / minute blocks with `RATE_LIMITED`.
