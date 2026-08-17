# Redis Integration Report

| Concern | Implementation |
|---------|----------------|
| Cache | Existing `ioredis` adapter when `REDIS_URL` set; memory fallback |
| Rate limit | `createRateLimitServiceSync` Redis fixed-window + memory fallback |
| Queue coordination | BullMQ `bandverse` + `bandverse-dlq` when Redis+bullmq present |
| Sessions | Auth sessions remain DB-backed (source of truth); Redis not required for revoke |
| Health | `/ready` verifies Redis ping when `REDIS_URL` set |
| Metrics | `rate_limit_*`, `jobs_enqueued_total`, `jobs_dlq_total` |

Graceful fallback preserved for local/CI without Redis.
