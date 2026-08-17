# BandVerse Deployment Guide

## Artifacts

- `web/Dockerfile` — multi-stage Next standalone image
- `web/docker-compose.yml` — web + Postgres + Redis
- `web/.env.production.example` — production env template

## Health checks

- Liveness: `GET /api/v1/live`
- Readiness: `GET /api/v1/ready` (fails if Prisma mode and DB down)
- Startup: wait for readiness before shifting traffic

## Platforms

### Docker Compose (local/staging)

```bash
cd web
cp .env.production.example .env
docker compose up --build
```

### Render / Railway

1. Connect repo, root `web/`
2. Build: `npm ci && npx prisma generate && npm run build`
3. Start: `npx prisma migrate deploy && npm run start`
4. Set `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`
5. Health path: `/api/v1/ready`

### AWS ECS

1. Build/push image from `web/Dockerfile`
2. Task definition with secrets from SSM/Secrets Manager
3. ALB health check → `/api/v1/live`
4. Target group readiness via `/api/v1/ready`
5. Sidecar or managed Redis (ElastiCache) + RDS Postgres

### Kubernetes

```yaml
livenessProbe:
  httpGet: { path: /api/v1/live, port: 3000 }
readinessProbe:
  httpGet: { path: /api/v1/ready, port: 3000 }
```

Run migrations as a Job/init container: `npx prisma migrate deploy`.

## Disaster recovery (minimum)

- Automated Postgres backups (PITR) with tested restore
- RPO ≤ 15m, RTO ≤ 1h for staging-class; tighten for production SLA
- Store secrets outside images
- Keep `BANDVERSE_PERSISTENCE` unset in production (never mock)
