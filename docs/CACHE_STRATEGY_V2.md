# BandVerse Cache Strategy V2

## Architecture

- Existing `CacheService` port (Redis when `REDIS_URL`, else memory)
- Redis Cluster ready: keyspace is prefix/tag based; no hard single-node assumptions beyond client URL
- `createSwrCache` adds stale-while-revalidate + warming + invalidation events

## Features

### Stale-while-revalidate

`rememberSwr(key, loader, { ttlSeconds, staleSeconds, tags })`

- Fresh hit → return immediately
- Stale but not expired → return stale, refresh in background
- Miss → load, store envelope `{ value, staleAt, expiresAt }`

### Cache warming

`swrCache.warm([{ key, loader, options }])` for post-deploy / post-failover warmups.

### Invalidation events

Publishes `CacheInvalidate` on the internal event bus. Subscribers invalidate by tag/namespace. Domain writes (bookings/reviews/events) publish tag invalidations.

## Hot paths

Search performers/venues/events use SWR via `createSearchService(..., swrCache)`.

## Metrics

- `cache_hit_total` / `cache_miss_total`
- `cache_swr_refresh_total` / `cache_swr_refresh_failed_total`
- `cache_warm_total`
