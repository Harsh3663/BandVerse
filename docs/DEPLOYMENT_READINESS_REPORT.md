# Deployment Readiness Report

## Guards

- `assertProductionEnvironment()` on container boot: strong `JWT_SECRET`, required `DATABASE_URL`, no mock persistence, payment keys or explicit sandbox
- `/api/v1/ready`: fails production mock; checks DB; checks Redis when configured
- Compose still example-grade — rotate secrets, unpublish DB ports, run `prisma migrate deploy` in real deploy pipelines

## Recommended start sequence

1. Set secrets from vault  
2. `prisma migrate deploy`  
3. Start app with `DATABASE_URL` + `JWT_SECRET` (+ `REDIS_URL`, payment keys)  
4. Confirm `/ready` returns prisma + database true  
