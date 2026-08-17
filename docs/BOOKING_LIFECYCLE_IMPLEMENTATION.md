# Booking Lifecycle Implementation

## Overview

Enterprise booking lifecycle layered on the existing BandVerse backend **without** changing landing pages or marketplace UI modules.

Core module: `web/src/backend/domain/booking-lifecycle.ts`  
Service: `web/src/backend/infrastructure/lifecycle/lifecycle-service.ts`  
APIs: `/api/v1/lifecycle/*`

Marketplace booking statuses (`requested`, `confirmed`, …) remain intact for existing UI; lifecycle statuses are the workflow source of truth for organizer/performer operations.

---

## 1. State machine

| Status | Meaning |
|--------|---------|
| `draft` | Lifecycle shell created |
| `invited` | Organizer invited performer |
| `applied` | Performer applied / accepted invite |
| `shortlisted` | Organizer shortlisted |
| `negotiating` | Terms under negotiation |
| `confirmed` | Booking confirmed (marketplace booking created) |
| `advance_paid` | Advance payment recorded |
| `contract_signed` | Contract signed |
| `upcoming` | Performance upcoming |
| `completed` | Event completed |
| `cancelled` | Cancelled / invite rejected / withdrawn |
| `disputed` | Dispute opened |

Invalid transitions throw `INVALID_TRANSITION` (HTTP 422/409 via API mapper).

---

## 2. Performer applications

| Action | API |
|--------|-----|
| Apply to event | `POST /api/v1/lifecycle/apply` |
| Withdraw | `POST /api/v1/lifecycle/:id/actions` `{ "action": "withdraw" }` |
| Accept invite | `{ "action": "accept_invite" }` |
| Reject invite | `{ "action": "reject_invite" }` |

Creates/updates marketplace `Application` records where applicable (`submitted` / `shortlisted` / `accepted` / `withdrawn`).

---

## 3. Organizer workflow

| Action | API |
|--------|-----|
| Create event | Existing `POST /api/v1/events` |
| Invite performer | `POST /api/v1/lifecycle/invite` |
| Shortlist | `{ "action": "shortlist" }` |
| Negotiate | `{ "action": "negotiate" }` |
| Confirm | `{ "action": "confirm", "agreedPaise": N }` |

Confirm creates a marketplace `Booking` in `confirmed` status and advances lifecycle through shortlist/negotiate as needed.

---

## 4. Booking timeline

Every transition appends:

- `timestamp`
- `actorUserId`
- `action`
- `fromStatus` / `toStatus`
- optional `metadata`

Retrieved via `GET /api/v1/lifecycle/:id` (`timeline` array).

Prisma models `BookingLifecycle` + `BookingTimelineEvent` added for durable projection (runtime service uses in-memory store in mock mode; Prisma schema ready for persistence wiring).

---

## 5. Contract module

`create_contract` stores:

- `terms`
- `performanceDate`
- `durationMinutes`
- `feePaise`

`sign_contract` marks signed and moves `advance_paid → contract_signed → upcoming`.

---

## 6. Payments integration

| Action | Kind |
|--------|------|
| `advance_paid` | Advance intent linked to booking |
| `balance_payment` | Remaining balance intent |
| `refund` | Refund intent |

Uses existing payment service + idempotency keys. Provider references stored on lifecycle (`advancePaymentId`, `balancePaymentId`, `refundPaymentId`).

---

## 7. Reviews

`POST /api/v1/reviews` calls `lifecycle.assertReviewAllowed(bookingId)`.

Only `completed` lifecycle (or marketplace `completed`/`reviewed` booking) may receive reviews → otherwise `409 CONFLICT`.

---

## 8. Notifications

Each transition enqueues `notification.email` with template `lifecycle.<action>` and lifecycle metadata. Also enqueues `booking.process` for downstream workers.

---

## 9. Analytics

`GET /api/v1/lifecycle/analytics`

Returns:

- **funnel** counts per lifecycle status  
- **applicationConversionRate** (confirmed÷applied family)  
- **revenuePaise** from completed  
- **topPerformers** by completed revenue  

---

## 10. Tests

`web/src/backend/infrastructure/lifecycle/lifecycle.test.ts`

- Transition table integrity  
- Full happy path invite→complete + timeline + review gate + analytics  
- Apply/withdraw + reject invite  
- Invalid jump rejection  
- Review blocked before completion  

---

## Validation

- `npm run typecheck` ✅  
- `npm run lint` ✅  
- `npm run test` ✅ (43 tests)  
- `npm run build` ✅  

---

## API quick reference

```
GET  /api/v1/lifecycle
GET  /api/v1/lifecycle/:id
POST /api/v1/lifecycle/invite
POST /api/v1/lifecycle/apply
POST /api/v1/lifecycle/:id/actions
GET  /api/v1/lifecycle/analytics
```
