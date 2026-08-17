# Multi-Vendor Event Planning Platform

## Overview

Phase 8 extends BandVerse from a performer marketplace into a **multi-vendor event planning platform**, without redesigning UI or replacing booking lifecycle, venue ecosystem, matching engine, messaging, or portfolio modules.

| Layer | Location |
|-------|----------|
| Domain module | `web/src/modules/event-planning` |
| Service | `web/src/backend/infrastructure/event-planning/event-planning-service.ts` |
| APIs | `/api/v1/vendors`, `/api/v1/packages`, `/api/v1/event-planner`, `/api/v1/budget-estimator` |
| Tests | `web/src/backend/infrastructure/event-planning/event-planning.test.ts` |

---

## Vendor taxonomy

Supported vendor types (Indian cultural + modern event services):

Musicians, Bands, DJs, Photographers, Videographers, Decorators, Anchors, MCs, Dance Groups, Mehendi Artists, Makeup Artists, Sound Vendors, Lighting Vendors, Wedding Planners, Pandit Services, Bhajan Mandali, Qawwali Groups, Folk Artists, Garba Teams, Dhol-Tasha Teams, Classical Artists.

Marketplace performers are bridged into vendor profiles via `vendorTypeFromPerformerKind` (read-only; performer module unchanged).

---

## Vendor profiles

Each vendor profile includes:

- services
- pricing (INR starting / typical, negotiable)
- coverage areas
- team size
- availability (timezone, blocked dates, weekly open days)
- portfolio URLs
- reviews
- verification flags

Discovery filters: `vendorType`, `city`, `budgetMin` / `budgetMax`, `minRating`, `availableOn`.

---

## Event requirements & package builder

Organizers can:

1. Create an event plan (`POST /api/v1/event-planner/plans`)
2. Select a curated package
3. Customize vendor slots (`PATCH /api/v1/event-planner/plans/:id`)
4. Estimate budget (`POST /api/v1/budget-estimator`)

Default wedding requirements example:

- Singer (musician) ×1
- DJ ×1
- Photographer ×2
- Decorator ×1
- Mehendi Artist ×2

---

## Vendor packages

Curated packages:

| Package | Focus |
|---------|--------|
| Wedding Music Package | Singer, DJ, sound, lighting |
| Corporate Event Package | Anchor, band, AV (+ venue estimate) |
| Garba Night Package | Garba team, DJ, lighting, sound |
| Traditional Maharashtrian Wedding Package | Pandit, bhajan, dhol-tasha, mehendi, decor, photo |
| Luxury Wedding Package | Planner-led full stack |

`PUT /api/v1/packages` upserts custom packages alongside curated ones.

---

## Budget engine

Estimates:

- vendor cost (package slots or selected vendors)
- venue cost (guest-based, city premium, capped vs budget)
- GST 18%
- platform service fee 5%
- total + within-budget flag

---

## AI event planner

`POST /api/v1/event-planner`

**Input:** event type, budget, city, guest count (optional package id)

**Output:**

- recommended package
- vendor stack (typed slots + filled vendors when available)
- recommended venue (optional enrichment via existing matching service — read-only)
- budget estimate
- reasons

Does **not** modify the matching engine; venue suggestions are optional enrichment.

---

## Analytics

Tracked via `GET|POST /api/v1/event-planner/analytics`:

- package views
- vendor views
- quote requests
- bookings
- revenue
- conversion rate (bookings / quote requests)

---

## APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/vendors` | Discover vendors |
| POST | `/api/v1/vendors` | Create vendor profile |
| GET | `/api/v1/vendors/:id` | Vendor detail (+ view track) |
| GET | `/api/v1/vendors/types` | Taxonomy list |
| GET | `/api/v1/packages` | List packages |
| PUT | `/api/v1/packages` | Upsert custom package |
| GET | `/api/v1/packages/:id` | Package detail |
| POST | `/api/v1/event-planner` | AI planner recommendation |
| POST | `/api/v1/event-planner/plans` | Create event plan |
| PATCH | `/api/v1/event-planner/plans/:id` | Customize plan |
| GET/POST | `/api/v1/event-planner/analytics` | Analytics snapshot / track |
| POST | `/api/v1/budget-estimator` | Budget estimate |

---

## Architecture boundaries

- Extends container with `eventPlanning` only
- Reuses repositories + optional `matching.matchVenues` read path
- Does not replace booking lifecycle, venue ecosystem APIs, messaging, or portfolio
- Experience/performer pricing packages remain separate; this layer is multi-vendor event packages
