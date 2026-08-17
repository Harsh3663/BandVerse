# BandVerse MFA Guide

## Overview

Enterprise MFA uses TOTP (RFC 6238) with hashed backup codes and trusted-device tracking. Secrets are encrypted at rest when Prisma persistence is enabled.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/auth/mfa/status` | MFA status + remaining backup codes |
| POST | `/api/v1/auth/mfa/setup` | Begin enrollment; returns secret, otpauth URL, backup codes |
| POST | `/api/v1/auth/mfa/enable` | Confirm TOTP code and enable MFA |
| POST | `/api/v1/auth/mfa/verify` | Verify TOTP/backup code; optional trust device |
| POST | `/api/v1/auth/mfa/disable` | Disable MFA with TOTP or backup code |
| GET | `/api/v1/auth/mfa/devices` | List trusted devices |
| DELETE | `/api/v1/auth/mfa/devices/:id` | Revoke trusted device |

## Session management

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/auth/sessions` | List active sessions |
| DELETE | `/api/v1/auth/sessions/:id` | Revoke one session |
| DELETE | `/api/v1/auth/sessions` | Revoke all other sessions |

## Enrollment flow

1. Authenticate and call `setup`.
2. Store backup codes offline (shown once).
3. Scan `otpauthUrl` in an authenticator app.
4. Call `enable` with a current 6-digit code.
5. On sensitive login challenges, call `verify` and optionally `trustDevice`.

## Security notes

- Backup codes are SHA-256 hashed; plaintext is never stored.
- MFA secret uses HMAC-bound envelope (`JWT_SECRET`).
- All enable/disable/session revoke actions write immutable audit events.
- Trusted devices are fingerprint + label keyed per user.
