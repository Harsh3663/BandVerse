export type RealtimeChannel =
  | `booking:${string}`
  | `conversation:${string}`
  | `user:${string}`
  | "platform";

export interface RealtimeMessage {
  readonly type: string;
  readonly channel: RealtimeChannel;
  readonly payload: Record<string, unknown>;
  readonly emittedAt: string;
}

export interface RealtimeGateway {
  publish(message: RealtimeMessage): Promise<void>;
  subscribe(
    channel: RealtimeChannel,
    listener: (message: RealtimeMessage) => void,
  ): () => void;
}

export interface NotificationMessage {
  readonly userId: string;
  readonly title: string;
  readonly body: string;
  readonly href?: string;
  readonly channel: "in_app" | "email" | "push";
}

export interface NotificationService {
  notify(message: NotificationMessage): Promise<void>;
  notifyMany(messages: readonly NotificationMessage[]): Promise<void>;
}
