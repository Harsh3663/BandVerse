import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type { QueuePort } from "@/backend/infrastructure/jobs";
import type {
  NotificationService,
  RealtimeGateway,
  RealtimeMessage,
} from "./ports";

type Listener = (message: RealtimeMessage) => void;

/** In-process pub/sub foundation for WebSocket/SSE adapters. */
export function createInProcessRealtimeGateway(): RealtimeGateway {
  const listeners = new Map<string, Set<Listener>>();

  return {
    async publish(message) {
      incrementMetric("realtime_messages_published_total");
      const channelListeners = listeners.get(message.channel);
      if (!channelListeners?.size) return;
      for (const listener of channelListeners) listener(message);
    },
    subscribe(channel, listener) {
      const set = listeners.get(channel) ?? new Set<Listener>();
      set.add(listener);
      listeners.set(channel, set);
      return () => {
        set.delete(listener);
      };
    },
  };
}

export function createNotificationService(options: {
  realtime: RealtimeGateway;
  queue: QueuePort;
}): NotificationService {
  return {
    async notify(message) {
      incrementMetric("notifications_sent_total");
      await options.realtime.publish({
        type: "notification",
        channel: `user:${message.userId}`,
        payload: {
          title: message.title,
          body: message.body,
          href: message.href,
          channel: message.channel,
        },
        emittedAt: new Date().toISOString(),
      });

      if (message.channel === "email") {
        await options.queue.enqueue("notification.email", {
          to: message.userId,
          template: "generic",
          data: { title: message.title, body: message.body },
        });
      }

      logger.info("Notification dispatched", {
        userId: message.userId,
        channel: message.channel,
      });
    },
    async notifyMany(messages) {
      for (const message of messages) {
        await this.notify(message);
      }
    },
  };
}

/**
 * SSE helper — serialize realtime messages for EventSource clients.
 * WebSocket adapters can call the same gateway.subscribe API.
 */
export function formatSseEvent(message: RealtimeMessage): string {
  return `event: ${message.type}\ndata: ${JSON.stringify(message)}\n\n`;
}
