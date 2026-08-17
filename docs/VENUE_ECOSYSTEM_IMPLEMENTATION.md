# Venue & Event Ecosystem Implementation

## Overview

Phase 6 extends BandVerse into a venue + event marketplace **without** redesigning UI or modifying completed lifecycle, portfolio, messaging, analytics, or payments modules.

| Layer | Location |
|-------|----------|
| Domain module | `web/src/modules/venues` |
| Service | `web/src/backend/infrastructure/venues/venue-ecosystem-service.ts` |
| APIs | `/api/v1/venue-ecosystem/*`, `/api/v1/events/discover`, `/api/v1/opportunities/nearby` |
| Venue dashboard | `/dashboard/venue` |
| Discover events | `/events/discover` |
| Tests | `web/src/backend/infrastructure/venues/venue-ecosystem.test.ts` |

---

## Venue management

New module: `src/modules/venues`

Supported venue types (additive; legacy aliases retained):

- hotel, cafe, restaurant, resort
- wedding-hall / wedding-venue
- banquet-hall, club, lounge
- corporate-venue / corporate-office
- college-venue / college

Profile facilities:

- stage, sound system, lighting, parking, food, accommodation

APIs:

- `GET|PUT /api/v1/venue-ecosystem/:venueId/facilities`

Existing `/api/v1/venues` create/list remains the profile CRUD entrypoint.

---

## Venue gallery

Kinds: `photo`, `video`, `virtual_tour`

- `GET|POST /api/v1/venue-ecosystem/:venueId/gallery`
- MIME/size checks via existing `mediaSecurity` (virtual tours are URL-only)

---

## Recurring gigs

Venue can create weekly live-music style gigs (e.g. every Friday 19:00–22:00 needing guitarist/singer/duo band).

Engine: `expandRecurringGigs` in `modules/venues/recurring-engine.ts`

- `GET|POST /api/v1/venue-ecosystem/:venueId/gigs`
- Expand: `GET .../gigs?fromDate=&toDate=`

---

## Event marketplace

- New page: `/events/discover` (filters: city, budget, category, date, performer type)
- API: `GET /api/v1/events/discover`
- Existing `/events` listing unchanged

---

## Performer applications

Facade over booking lifecycle (lifecycle code untouched):

`POST /api/v1/venue-ecosystem/applications/actions`

Actions: `apply`, `withdraw`, `shortlist`, `invite`, `reject`

---

## Venue dashboard

`/dashboard/venue`

Metrics: bookings, revenue, performer response rate, upcoming events, active gigs  
Plus verification badges, recurring gigs, analytics summary.

---

## Discovery improvements

Nearby opportunities:

- `GET /api/v1/opportunities/nearby?city=`
- Ranking: city match + relevance + reviews + response rate + completion rate
- Shown on `/events/discover`

---

## Trust system

Venue verification flags:

- GST, business, phone, email

`GET|PATCH /api/v1/venue-ecosystem/:venueId/verification`

---

## Analytics

Venue-specific (new endpoints; existing analytics modules unchanged):

- `GET /api/v1/venue-ecosystem/:venueId/dashboard`
- `GET /api/v1/venue-ecosystem/:venueId/analytics`

Fields: total events, revenue, booking conversion, cancellation rate.

---

## Constraints honored

- Landing pages unchanged
- Marketplace UI components not redesigned
- Lifecycle / portfolio / messaging / payments / existing analytics modules not modified
- Routes added only; none removed
- Architecture extended via container service pattern
