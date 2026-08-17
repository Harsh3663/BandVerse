# BandVerse Disaster Recovery Plan

## Objectives

| Metric | Target |
|--------|--------|
| RPO | ≤ 5 minutes (Postgres PITR / continuous WAL) |
| RTO | ≤ 30 minutes for core API + auth + bookings/payments read path |

## PostgreSQL

- Daily full base backups + continuous WAL archiving
- Weekly restore drill to staging
- Failover: promote hot standby / managed primary failover
- App behavior: Prisma retry + circuit breaker during flap

### Restore steps

1. Provision recovery instance from latest base backup
2. Replay WAL to recovery point
3. Validate `SELECT 1`, auth login, booking read
4. Point `DATABASE_URL` at recovered primary
5. Invalidate Redis namespace `search` / `bookings`

## Redis

- Redis is cache/rate-limit/queue accelerator, not system of record
- Recovery: provision new Redis, set `REDIS_URL`, restart app
- App falls back to in-memory cache if Redis unavailable
- After restore: warm search cache via SWR warm helpers

## Object / media storage

- Versioned bucket with cross-region replication
- Restore: promote replica or rehydrate from version markers
- Signed URL secrets rotate independently of media bytes

## Migration rollback

1. Keep previous Prisma migration SQL + deploy artifact
2. Prefer expand/contract migrations (additive first)
3. Rollback app image first if schema is backward compatible
4. For breaking schema: restore DB snapshot taken pre-migrate, redeploy previous image

## Communication

Declare severity, RPO/RTO clock start, customer impact, and next update cadence in on-call channels (see `ONCALL_GUIDE.md`).
