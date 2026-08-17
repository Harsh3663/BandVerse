# AI Talent Matching Engine Implementation

## Overview

Phase 7 adds an intelligent performer ↔ event ↔ venue matching layer **without** modifying marketplace UI, booking lifecycle, venue ecosystem, portfolio, or messaging modules.

| Layer | Location |
|-------|----------|
| Domain module | `web/src/modules/matching` |
| Engine | `TalentMatchingEngine` (`engine.ts`) |
| Service | `web/src/backend/infrastructure/matching/matching-service.ts` |
| APIs | `/api/v1/matching/*` |
| Tests | `web/src/backend/infrastructure/matching/matching.test.ts` |

Existing `POST /api/v1/recommendations` remains unchanged.

---

## Matching inputs

`MatchingEventContext`:

- event / venue ids (optional)
- budget, location (city), date
- audience size / type
- music preferences (`genreIds`, `languageIds`)
- amenities / capacity (venue matching)

Performer signals used:

- portfolio media density (+ optional portfolio completeness read)
- reviews / ratings
- response time
- completion & booking success (social proof)
- travel / distance
- pricing packages
- category / event-type support
- availability calendar
- booking-oriented experience

---

## Match score (0–100)

Weighted factors (`MATCH_WEIGHTS`, sum = 100):

| Factor | Weight |
|--------|--------|
| Experience | 12 |
| Portfolio quality | 10 |
| Reviews | 12 |
| Response rate | 8 |
| Distance | 12 |
| Budget fit | 14 |
| Category match | 10 |
| Language match | 8 |
| Availability | 8 |
| Past success | 6 |

---

## Recommendation bundles

`GET /api/v1/matching/performers`

Returns:

- `topPerformers` (≤10 solos/DJs)
- `topBands` (≤5 bands/ensembles/groups)
- `topLocal`
- `bestValue` (score / price)
- `premium`

Each result includes:

- `matchScore`
- `breakdown`
- `reasons`
- `whyRecommended` (e.g. “92 Match Score” + bullet reasons)

---

## Venue matching

`GET /api/v1/matching/venues`

Ranks venues by:

- capacity
- location
- amenities
- preferred event type
- verification / soft budget cues

---

## Performer insights

`GET /api/v1/matching/events?performerId=`

Suggested events to apply for (“Events you should apply for”), scored with the same engine.

---

## Analytics

`GET|POST /api/v1/matching/analytics`

Tracks:

- recommendation impressions
- clicks
- applications
- bookings
- CTR + conversion

---

## API summary

| Method | Path |
|--------|------|
| GET | `/api/v1/matching/performers` |
| GET | `/api/v1/matching/venues` |
| GET | `/api/v1/matching/events` |
| GET/POST | `/api/v1/matching/analytics` |

Query params for performer/venue match: `eventTypeId`, `budget`, `city`, optional `date`, `audienceSize`, `genreIds`, `languageIds`, `venueId`, `capacityNeeded`, `requiredAmenities`.

---

## Constraints honored

- No UI redesign
- Marketplace recommendation module not replaced
- Lifecycle / venue-ecosystem / portfolio / messaging not modified (portfolio completeness is read-only via container)
- Architecture extended via container `matching` service only
