# Persistence Migration Report

## Status

- **API production path:** Prisma when `DATABASE_URL` set and `BANDVERSE_PERSISTENCE≠mock`
- **Optimistic locking:** Booking updates use `updateMany` with optional version CAS → 409 on conflict
- **Pagination/filtering:** Existing use cases retained (bookings host/performer/status, search filters)
- **Transactions:** Auth session rotate / payment ledger paths use atomic updates; GDPR erasure batched deletes

## Frontend freeze note

`mockMarketplaceRepositories` remains in dashboard/UI pages per **no frontend UX changes** constraint. Backend APIs are DB-backed in Prisma mode. UI data-source cutover is deferred to a frontend-approved change.

## Remaining

- Chats/offers/contracts still mock adapters under Prisma platform repos (non-critical surfaces)
- Dashboard pages still mock until UI freeze lifts
