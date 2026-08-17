# Queue Implementation Report

## BullMQ

- Dependency: `bullmq`
- Queues: `bandverse` (main), `bandverse-dlq` (dead letter)
- Retries: default 5 with exponential backoff (1s base)
- Wired in `container.ts` when `REDIS_URL` available; else memory job system

## Job names

`booking.process`, `recommendation.generate`, `analytics.aggregate`, `notification.email`, `notification.push`, `payment.reconcile`, `payment.settle`, `search.index`

Handlers registered in `register-handlers.ts`.
