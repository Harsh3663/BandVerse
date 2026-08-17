# BandVerse Backend Architecture

Production-oriented backend foundation layered on the existing Next.js marketplace.

## Architecture summary

```
web/src/app/api/v1/*          Presentation (HTTP route handlers)
        ↓
web/src/backend/presentation  Response/error/pagination adapters
        ↓
web/src/backend/application   Use cases, ports, DTOs, mappers
        ↓
web/src/backend/domain        Entities + enums
        ↓
web/src/backend/infrastructure
  ├── persistence/mock        Adapters over marketplace repositories
  ├── persistence/drizzle     Drizzle plan
  └── security                RBAC/ABAC, JWT stub, rate limit, media
web/prisma/schema.prisma      PostgreSQL production schema
web/src/modules/marketplace   Existing domain logic (reused, not duplicated)
```

## Dependency map (frontend → backend readiness)

| UI area | Current source | Backend path |
|--------|----------------|--------------|
| Discovery/search | `data/discovery` + marketplace adapter | future search index + performers API |
| Profiles | marketplace mock repos | `GET /api/v1/performers/*` |
| Bookings | mock + state machines | `GET/POST /api/v1/bookings` |
| Applications | mock + state machines | `GET /api/v1/applications` |
| Recommendations | `getRecommendations` | `POST /api/v1/recommendations` |
| Analytics | marketplace analytics helpers | `/api/v1/analytics/*` |
| Auth UI demos | `features/information/demo-forms` | stub `/api/v1/auth/*` |

## Soft delete / audit / versioning

- Soft delete via `deletedAt`
- Optimistic concurrency via `version`
- Append-only `AuditLog` + `Activity`
- Money stored as integer paise in persistence schemas

## Security model

- RBAC role → permission matrix
- ABAC ownership/status checks
- JWT access (15m) + refresh (30d, rotate-on-use) architecture
- In-memory rate limits (replace with Redis in production)
- Media MIME/size/extension validation + OWASP checklist module

## Scores (current)

See `docs/PRODUCTION_READINESS_REPORT.md` for the latest scored assessment after Prisma auth/API hardening.

| Dimension | Score | Notes |
|-----------|------:|-------|
| Backend readiness | 88/100 | Prisma repos + completed marketplace APIs |
| Scalability | 74/100 | Indexed schema; replace in-memory limiter for multi-node |
| Security | 82/100 | jose JWT, bcrypt, RBAC/ABAC, cookies, audit |
| Production readiness | 78/100 | Staging-ready with Postgres; payments/realtime remain |
