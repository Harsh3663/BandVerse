import { randomBytes } from "node:crypto";

import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";

export type DomainEventName =
  | "BookingCreated"
  | "BookingConfirmed"
  | "PaymentCompleted"
  | "ReviewCreated"
  | "EventPublished"
  | "CacheInvalidate";

export interface DomainEvent<TName extends DomainEventName = DomainEventName> {
  readonly id: string;
  readonly name: TName;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly payload: Record<string, unknown>;
}

export type DomainEventHandler<TName extends DomainEventName = DomainEventName> = (
  event: DomainEvent<TName>,
) => Promise<void> | void;

export interface EventBus {
  publish<TName extends DomainEventName>(
    name: TName,
    payload: Record<string, unknown>,
    correlationId?: string,
  ): Promise<DomainEvent<TName>>;
  subscribe<TName extends DomainEventName>(
    name: TName,
    handler: DomainEventHandler<TName>,
  ): () => void;
}

/** In-process event bus. Kafka/NATS can replace the transport without changing publishers. */
export function createInProcessEventBus(): EventBus {
  const handlers = new Map<DomainEventName, Set<DomainEventHandler>>();

  return {
    async publish(name, payload, correlationId) {
      const event: DomainEvent = {
        id: `evt_${randomBytes(8).toString("hex")}`,
        name,
        occurredAt: new Date().toISOString(),
        correlationId,
        payload,
      };
      incrementMetric("domain_events_published_total");
      logger.info("domain.event", {
        requestId: event.id,
        route: event.name,
        correlationId: event.correlationId,
      });
      const set = handlers.get(name);
      if (set) {
        for (const handler of set) {
          try {
            await handler(event);
          } catch (error) {
            logger.error("Domain event handler failed", {
              route: name,
              cause: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
      return event as DomainEvent<typeof name>;
    },
    subscribe(name, handler) {
      const set = handlers.get(name) ?? new Set();
      set.add(handler as DomainEventHandler);
      handlers.set(name, set);
      return () => set.delete(handler as DomainEventHandler);
    },
  };
}
