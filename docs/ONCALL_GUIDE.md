# BandVerse On-Call Guide

## Responsibilities

- Protect auth, bookings, payments, and data integrity
- Follow runbooks before improvising
- Keep a timeline of actions and customer impact

## Severity

| SEV | Definition | Response |
|-----|------------|----------|
| SEV-1 | Payments/auth down or data loss risk | Immediate page; all-hands bridge |
| SEV-2 | Major feature degraded (bookings/search) | 15-minute ack |
| SEV-3 | Partial degradation / elevated errors | Next business hours OK if stable |

## First 10 minutes

1. Ack page
2. Open metrics + logs with correlation IDs
3. Check health/ready/live
4. Identify blast radius (region, deploy, dependency)
5. Apply matching runbook section

## Handoff checklist

- Current hypothesis
- Actions taken + timestamps
- Open questions
- Customer comms sent
- Next checkpoint time

## Escalation

- Platform/DB: DBA / cloud provider support
- Payments: provider support + finance
- Security incident: rotate secrets, revoke sessions (`DELETE /api/v1/auth/sessions`), enable MFA enforcement for admins
