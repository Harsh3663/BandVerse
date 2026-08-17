# Performer Portfolio System

## Overview

Production performer portfolio extension for BandVerse. Layered on the existing backend container and marketplace modules **without** changing landing pages, booking lifecycle internals, backend architecture, or existing dashboard layouts.

| Layer | Location |
|-------|----------|
| Domain | `web/src/backend/domain/portfolio.ts` |
| Service | `web/src/backend/infrastructure/portfolio/portfolio-service.ts` |
| APIs | `/api/v1/portfolio/*`, `/api/v1/availability`, `/api/v1/discovery/rank` |
| Showcase | `/showcase/[handle]` |
| Widgets (additive) | `portfolio-analytics-widgets.tsx` + analytics widgets API |
| Tests | `web/src/backend/infrastructure/portfolio/portfolio.test.ts` |

---

## 1. Media portfolio

Each media item:

`id`, `performerId`, `title`, `description`, `mediaType`, `thumbnail`, `url`, `duration`, `createdAt`

Supported `mediaType` values:

- `performance_video`
- `audio_sample`
- `photo`
- `youtube`
- `instagram_reel`
- `spotify`
- `website`

| Action | API |
|--------|-----|
| List | `GET /api/v1/portfolio/:performerId/media` |
| Create | `POST /api/v1/portfolio/:performerId/media` |
| Update | `PATCH /api/v1/portfolio/:performerId/media/:mediaId` |
| Delete | `DELETE /api/v1/portfolio/:performerId/media/:mediaId` |
| Showcase aggregate | `GET /api/v1/portfolio/:performerId` |

URL host validation is enforced per media type. Optional MIME/size checks reuse `mediaSecurity`.

---

## 2. Performance showcase

Public page: **`/showcase/[handle]`**

Displays:

- Hero media
- Featured / top performance videos
- Photo gallery
- Audio samples
- Genres, languages, instruments
- Setlists
- Monthly availability calendar
- Reviews
- Booking CTA
- **Verified Event Performance** badge when verified performances exist

Reuses existing media showcase components and booking CTA patterns. Does not alter `/artist/*` or landing routes.

---

## 3. Verified performances

Fields: `eventId`, `organizerId`, `performerId`, `verificationStatus` (`pending` \| `verified` \| `rejected`)

| Action | API |
|--------|-----|
| List | `GET /api/v1/portfolio/:performerId/verified` |
| Request | `POST /api/v1/portfolio/:performerId/verified` |
| Review | `PATCH /api/v1/portfolio/:performerId/verified/:id` |

Verified records surface the **Verified Event Performance** badge on showcase and list payloads.

---

## 4. Setlists

Event types: `wedding`, `corporate`, `sufi_night`, `bollywood_night`, `classical`, `garba`, `dj`

Stored fields: `title`, `songs`, `duration`, `eventType`

| Action | API |
|--------|-----|
| List / create | `GET\|POST /api/v1/portfolio/:performerId/setlists` |

---

## 5. Availability calendar

Day statuses: `available`, `tentative`, `booked`, `blocked`

Monthly view via:

- `GET /api/v1/portfolio/:performerId/availability?year=&month=`
- `PUT /api/v1/portfolio/:performerId/availability`
- `GET\|PUT /api/v1/availability` (performer owner bridged to portfolio)

Lifecycle integration (read-only against lifecycle service):

- `POST /api/v1/portfolio/:performerId/availability/sync-lifecycle`

Maps lifecycle statuses to calendar days:

| Lifecycle | Calendar |
|-----------|----------|
| invited / applied / shortlisted / negotiating | `tentative` |
| confirmed → completed | `booked` |

---

## 6. Media analytics

Tracked events: `video_view`, `portfolio_view`, `profile_view`, `click`, `booking_start`, `booking_conversion`

Derived: **CTR**, **booking conversion rate**

| Action | API |
|--------|-----|
| Snapshot | `GET /api/v1/portfolio/:performerId/analytics` |
| Track | `POST /api/v1/portfolio/:performerId/analytics` |
| Widgets | `GET /api/v1/portfolio/:performerId/analytics/widgets` |

Widget UI component is exported for optional composition; existing dashboard page layouts are intentionally untouched.

---

## 7. Discovery boost

Ranking signals:

- Rating
- Verified performances
- Portfolio completeness
- Response time
- Booking success rate

Applied in:

- `recommendPerformersUseCase` (re-ranks marketplace recommendations)
- Search performer relevance/rating sort (discovery boost tie-breaker)
- `POST /api/v1/discovery/rank`

---

## 8. Persistence

Prisma models (`PortfolioMedia`, `PerformerSetlist`, `VerifiedPerformance`, `PortfolioAnalyticsEvent`) are schema-ready. Runtime service is memory-backed (same pattern as booking lifecycle) so mock mode and tests stay green without a database.

---

## 9. Tests

`portfolio.test.ts` covers:

- Portfolio media CRUD
- Media URL validation
- Calendar month + lifecycle sync
- Discovery ranking / completeness
- Verified performances

---

## Constraints honored

- Landing pages unchanged
- Booking lifecycle module not redesigned (read-only sync integration)
- Backend container / ports architecture extended, not replaced
- Existing dashboard layouts unchanged
