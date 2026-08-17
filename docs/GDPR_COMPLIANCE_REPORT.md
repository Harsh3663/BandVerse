# GDPR Compliance Report

`POST /api/v1/privacy/erasure` now:

**Deletes:** sessions, MFA backup codes, trusted devices, notifications, MFA secret (null), password hash  
**Anonymizes:** user PII fields, audit actor/IP/UA references, ledger metadata userId when present  
**Retains:** financial amounts / booking operational rows for legal hold (non-PII)

Status: `completed` when Prisma available; `scheduled` in mock mode.
