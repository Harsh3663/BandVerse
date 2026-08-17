# BandVerse Load Testing

k6 scripts for API smoke, stress, bookings, and search.

## Prerequisites

- [k6](https://k6.io/) installed
- App running (`npm run dev` or staging URL)

## Commands

```bash
k6 run -e BASE_URL=http://localhost:3000 load-testing/k6/smoke.js
k6 run -e BASE_URL=http://localhost:3000 load-testing/k6/api-stress.js
k6 run -e BASE_URL=http://localhost:3000 load-testing/k6/search.js
k6 run -e BASE_URL=http://localhost:3000 load-testing/k6/bookings.js
```

See `docs/PERFORMANCE_BENCHMARK.md` for capacity targets.
