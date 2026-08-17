# Messaging System Implementation

## Overview

Production internal messaging & negotiation for BandVerse, layered on the existing backend container, SSE gateway, notification queue, and media security — **without** changing landing pages, marketplace UI modules, booking lifecycle, portfolio system, or backend architecture.

| Layer | Location |
|-------|----------|
| Domain | `web/src/backend/domain/messaging.ts` |
| Service | `web/src/backend/infrastructure/messaging/messaging-service.ts` |
| APIs | `/api/v1/conversations/*`, `/api/v1/messages/*`, `/api/v1/messaging/analytics` |
| Feature UI (additive) | `web/src/features/messaging/messaging-panel.tsx` |
| Tests | `web/src/backend/infrastructure/messaging/messaging.test.ts` |

---

## 1. Conversations

Participants: **organizer** + **performer**

Fields: `id`, `bookingId?`, `eventId?`, `organizerId`, `performerId`, `createdAt`, `updatedAt`

| Action | API |
|--------|-----|
| List mine | `GET /api/v1/conversations` |
| Create | `POST /api/v1/conversations` |
| Detail | `GET /api/v1/conversations/:id` |
| By booking | `GET /api/v1/conversations/by-booking/:bookingId` |

Creating with the same `bookingId` is idempotent.

---

## 2. Messages

Types: `text` \| `image` \| `document` \| `audio`

Fields: `id`, `conversationId`, `senderId`, `messageType`, `content`, `attachmentUrl?`, `sentAt`, `editedAt?`, `deletedAt?`

| Action | API |
|--------|-----|
| List | `GET /api/v1/messages?conversationId=` or `GET /api/v1/conversations/:id/messages` |
| Send | `POST /api/v1/messages` |

Only conversation participants may send/read. Soft-delete and text edit are supported on the service.

---

## 3. Negotiation offers

Structured offers (separate from legacy marketplace `OfferStatus`):

Fields: `amount`, `currency`, `notes`, `status`, plus `parentOfferId` for counters

States: `pending` → `accepted` \| `rejected` \| `countered`

| Action | API |
|--------|-----|
| List / create | `GET\|POST /api/v1/conversations/:id/offers` |
| Accept / reject / counter | `POST /api/v1/conversations/:id/offers/:offerId/actions` |

Full history retained via `listOffers`.

---

## 4. Realtime (existing SSE)

Reuses `container.realtime` + `/api/v1/realtime/sse` (user channel).

Published events:

| Event | Purpose |
|-------|---------|
| `new_message` | Message created/edited |
| `typing_indicator` | Typing state |
| `offer_update` | Offer created / accepted / rejected / countered |
| `read_receipt` | Delivered / read updates |

Also published on `conversation:{id}` and `booking:{bookingId}` when applicable.

Typing: `POST /api/v1/conversations/:id/typing` `{ "typing": true }`

---

## 5. Read receipts

Per participant: `sent` → `delivered` → `read`

| Action | API |
|--------|-----|
| List | `GET /api/v1/messages/:id/receipts` |
| Update | `POST /api/v1/messages/:id/receipts` `{ "status": "delivered" \| "read" }` |

---

## 6. Attachments

Supported: PDF, DOCX, images (plus audio message type)

Validation reuses `mediaSecurity` (MIME + size + extension). DOCX MIME added to the allow-list.

---

## 7. Booking / dashboard integration

No marketplace component redesign.

- **Booking details** (`/bookings/[id]`): seeds conversation, passes chat thread into existing `BookingLifecycle`, adds additive `BookingMessagingPanel`
- **Performer / organizer dashboards**: additive `MessagingInboxPanel` below existing overview components

---

## 8. Notifications

On new message / new offer / offer accepted / offer rejected:

1. In-app via `notifications.notify` (SSE `notification`)
2. Email job via `queue.enqueue("notification.email", …)`

---

## 9. Analytics

`GET /api/v1/messaging/analytics`

Tracks: message count, response time (avg ms), response rate, negotiation success rate, offers sent/accepted.

---

## 10. Persistence

Prisma models (`MessagingConversation`, `MessagingMessage`, `NegotiationOffer`, `MessageReceipt`) are schema-ready. Runtime service is memory-backed (same pattern as lifecycle/portfolio) for mock mode and tests.

---

## Constraints honored

- Landing pages unchanged
- Marketplace UI modules unchanged
- Booking lifecycle / portfolio systems unchanged
- Backend architecture extended via container service (not redesigned)
- Existing SSE + queue + media security reused
