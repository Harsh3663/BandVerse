# BandVerse Event-Driven Architecture

## Scope

Internal in-process `EventBus` interface. **No Kafka dependency.** Transport can later swap to NATS/SQS/Kafka without changing publishers.

## Domain events

| Event | When |
|-------|------|
| `BookingCreated` | Booking POST |
| `BookingConfirmed` | Booking status → confirmed |
| `PaymentCompleted` | Paid webhook processed |
| `ReviewCreated` | Review POST |
| `EventPublished` | Event created/updated as published |
| `CacheInvalidate` | Cache tag/namespace invalidation |

## Interface

```ts
interface EventBus {
  publish(name, payload, correlationId?): Promise<DomainEvent>;
  subscribe(name, handler): () => void;
}
```

## Current subscribers

- `PaymentCompleted` → in-app notification
- `CacheInvalidate` → SWR/cache tag invalidation

## Future transport swap

1. Keep `EventBus` contract
2. Implement Redis Streams / SQS adapter behind same interface
3. Add outbox table if cross-process durability is required
4. Do not couple domain modules to broker SDKs
