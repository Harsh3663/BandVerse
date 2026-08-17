# BandVerse Database Resiliency

## Capabilities

| Capability | Implementation |
|------------|----------------|
| Retry policy | `withRetry` — exponential backoff for deadlock/timeout/connection |
| Deadlock retry | Detects `deadlock` / `40P01` / serialization failures |
| Circuit breaker | `dbCircuitBreaker` — opens after threshold failures |
| Transaction wrapper | `withTransactionRetry` |
| Health checks | `checkDatabaseConnectivity` uses retry + breaker |
| Generic wrapper | `withDbResilience(fn)` |

## Usage

```ts
await withDbResilience(() =>
  prisma.$transaction(async (tx) => {
    // ...
  }),
);
```

## Production tuning

- `failureThreshold`: 5
- `coolDownMs`: 30s
- Retries: 3 (txn default)
- Pair with PgBouncer / managed pooling in deployment assets

## Metrics

- `db_retry_total`
- `db_circuit_open_total`
