# BandVerse Performance Benchmark

## Load-test pack

Location: `load-testing/`

| Script | Focus |
|--------|-------|
| `k6/smoke.js` | Health + public reads |
| `k6/api-stress.js` | Mixed API stress |
| `k6/bookings.js` | Authenticated booking load |
| `k6/search.js` | Search SWR path |

Run example:

```bash
k6 run -e BASE_URL=http://localhost:3000 load-testing/k6/smoke.js
```

## Capacity estimates (architecture-relative)

Assumptions: 2–4 Next.js instances, managed Postgres with pooler, Redis for cache/rate-limit, p95 API < 300ms for cached reads.

| Concurrent users | Expected healthy shape | Primary bottlenecks |
|------------------|------------------------|---------------------|
| 1k | Comfortable; single region OK | App CPU negligible |
| 10k | Needs HA app + Redis + DB pooler | Search/booking writes |
| 50k | Horizontal app scale, read replicas, cache hit > 80% | Postgres write IOPS, webhook fan-in |
| 100k | Multi-AZ, replica reads, queue workers isolated, CDN for static | Event bus must leave process-local; DB/payment providers |

## Targets

- Auth login p95 < 400ms (without MFA challenge UI)
- Search cached p95 < 150ms
- Booking create p95 < 500ms
- Error rate < 1% under stated load
- Webhook processing lag < 30s p95

Validate with k6 before each major release.
