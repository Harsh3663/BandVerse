import { randomBytes } from "node:crypto";

import type { MediaSecurityService } from "@/backend/application/ports/services";
import {
  canTransitionOffer,
  isMessageType,
  isParticipant,
  MessageType,
  NegotiationOfferStatus,
  otherParticipantId,
  ReceiptStatus,
  type Conversation,
  type Message,
  type MessageReceipt,
  type MessageType as MsgType,
  type MessagingAnalytics,
  type NegotiationOffer,
  type NegotiationOfferStatus as OfferStatus,
  type ReceiptStatus as RecStatus,
} from "@/backend/domain/messaging";
import type { QueuePort } from "@/backend/infrastructure/jobs";
import type {
  NotificationService,
  RealtimeChannel,
  RealtimeGateway,
} from "@/backend/infrastructure/realtime/ports";
import { forbiddenError, notFoundError, validationError } from "@/backend/shared/errors";

function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

const ATTACHMENT_MIME_BY_TYPE: Record<
  Exclude<MsgType, "text">,
  readonly string[]
> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav"],
};

export interface MessagingService {
  createConversation(input: {
    organizerId: string;
    performerId: string;
    bookingId?: string;
    eventId?: string;
    actorUserId: string;
  }): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  listConversationsForUser(userId: string): Promise<readonly Conversation[]>;
  getByBooking(bookingId: string): Promise<Conversation | undefined>;
  sendMessage(input: {
    conversationId: string;
    senderId: string;
    messageType: string;
    content: string;
    attachmentUrl?: string;
    mimeType?: string;
    sizeBytes?: number;
    originalName?: string;
  }): Promise<Message>;
  editMessage(input: {
    messageId: string;
    senderId: string;
    content: string;
  }): Promise<Message>;
  softDeleteMessage(input: {
    messageId: string;
    senderId: string;
  }): Promise<Message>;
  listMessages(conversationId: string): Promise<readonly Message[]>;
  markDelivered(input: {
    messageId: string;
    participantId: string;
  }): Promise<MessageReceipt>;
  markRead(input: {
    messageId: string;
    participantId: string;
  }): Promise<MessageReceipt>;
  listReceipts(messageId: string): Promise<readonly MessageReceipt[]>;
  createOffer(input: {
    conversationId: string;
    senderId: string;
    amount: number;
    currency?: string;
    notes?: string;
  }): Promise<NegotiationOffer>;
  acceptOffer(input: {
    offerId: string;
    actorUserId: string;
  }): Promise<NegotiationOffer>;
  rejectOffer(input: {
    offerId: string;
    actorUserId: string;
  }): Promise<NegotiationOffer>;
  counterOffer(input: {
    offerId: string;
    senderId: string;
    amount: number;
    currency?: string;
    notes?: string;
  }): Promise<{ previous: NegotiationOffer; offer: NegotiationOffer }>;
  listOffers(conversationId: string): Promise<readonly NegotiationOffer[]>;
  setTyping(input: {
    conversationId: string;
    userId: string;
    typing: boolean;
  }): Promise<void>;
  getAnalytics(userId: string): Promise<MessagingAnalytics>;
  assertParticipant(conversationId: string, userId: string): Promise<Conversation>;
  toChatThread(conversationId: string): Promise<{
    id: string;
    bookingId?: string;
    participants: readonly { userId: string; role: "host" | "performer" }[];
    messages: readonly {
      id: string;
      threadId: string;
      senderId: string;
      body: string;
      sentAt: string;
      readBy: readonly string[];
    }[];
    updatedAt: string;
  }>;
}

export function createMessagingService(options: {
  realtime: RealtimeGateway;
  notifications: NotificationService;
  queue: QueuePort;
  mediaSecurity?: MediaSecurityService;
}): MessagingService {
  const conversations = new Map<string, Conversation>();
  const messages = new Map<string, Message>();
  const offers = new Map<string, NegotiationOffer>();
  const receipts = new Map<string, MessageReceipt>();
  const lastMessageAtByUser = new Map<string, number>();
  const responseSamples = new Map<string, number[]>();
  const inboundExpectingReply = new Map<string, number>();

  function receiptKey(messageId: string, participantId: string): string {
    return `${messageId}:${participantId}`;
  }

  async function publishToParticipants(
    conversation: Conversation,
    type: string,
    payload: Record<string, unknown>,
  ) {
    const emittedAt = isoNow();
    const channels: RealtimeChannel[] = [
      `conversation:${conversation.id}`,
      `user:${conversation.organizerId}`,
      `user:${conversation.performerId}`,
    ];
    if (conversation.bookingId) {
      channels.push(`booking:${conversation.bookingId}`);
    }
    for (const channel of channels) {
      await options.realtime.publish({ type, channel, payload, emittedAt });
    }
  }

  async function notifyUser(
    userId: string,
    title: string,
    body: string,
    href?: string,
  ) {
    await options.notifications.notify({
      userId,
      title,
      body,
      href,
      channel: "in_app",
    });
    await options.queue.enqueue("notification.email", {
      to: userId,
      template: "messaging",
      data: { title, body, href: href ?? "" },
    });
  }

  function trackInbound(recipientId: string) {
    inboundExpectingReply.set(
      recipientId,
      (inboundExpectingReply.get(recipientId) ?? 0) + 1,
    );
  }

  function trackResponse(responderId: string) {
    const now = Date.now();
    const previous = lastMessageAtByUser.get(
      // peer last message time approximated via expecting reply marker time unused;
      // use simple rolling average from last own gap
      responderId,
    );
    lastMessageAtByUser.set(responderId, now);
    if (previous) {
      const samples = responseSamples.get(responderId) ?? [];
      samples.push(now - previous);
      responseSamples.set(responderId, samples.slice(-50));
    }
  }

  const service: MessagingService = {
    async createConversation(input) {
      if (!input.organizerId || !input.performerId) {
        throw validationError("organizerId and performerId are required.");
      }
      if (input.organizerId === input.performerId) {
        throw validationError("Organizer and performer must be different users.");
      }
      if (
        input.actorUserId !== input.organizerId &&
        input.actorUserId !== input.performerId
      ) {
        throw forbiddenError("Only participants can create a conversation.");
      }

      if (input.bookingId) {
        const existing = [...conversations.values()].find(
          (c) => c.bookingId === input.bookingId,
        );
        if (existing) return existing;
      }

      const now = isoNow();
      const conversation: Conversation = {
        id: id("conv"),
        organizerId: input.organizerId,
        performerId: input.performerId,
        bookingId: input.bookingId,
        eventId: input.eventId,
        createdAt: now,
        updatedAt: now,
      };
      conversations.set(conversation.id, conversation);
      return conversation;
    },

    async getConversation(conversationId) {
      return conversations.get(conversationId);
    },

    async listConversationsForUser(userId) {
      return [...conversations.values()]
        .filter((c) => isParticipant(c, userId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async getByBooking(bookingId) {
      return [...conversations.values()].find((c) => c.bookingId === bookingId);
    },

    async assertParticipant(conversationId, userId) {
      const conversation = conversations.get(conversationId);
      if (!conversation) throw notFoundError("Conversation", conversationId);
      if (!isParticipant(conversation, userId)) {
        throw forbiddenError("Not a conversation participant.");
      }
      return conversation;
    },

    async sendMessage(input) {
      const conversation = await service.assertParticipant(
        input.conversationId,
        input.senderId,
      );
      if (!isMessageType(input.messageType)) {
        throw validationError("Unsupported messageType.");
      }
      const messageType = input.messageType as MsgType;
      const content = input.content?.trim() ?? "";
      if (messageType === MessageType.TEXT && !content) {
        throw validationError("Text content is required.");
      }

      if (messageType !== MessageType.TEXT) {
        if (!input.attachmentUrl) {
          throw validationError("attachmentUrl is required for non-text messages.");
        }
        if (!input.mimeType || typeof input.sizeBytes !== "number") {
          throw validationError("mimeType and sizeBytes are required for attachments.");
        }
        const allowed = ATTACHMENT_MIME_BY_TYPE[messageType];
        if (!allowed.includes(input.mimeType.toLowerCase())) {
          throw validationError(
            `MIME type ${input.mimeType} is not allowed for ${messageType}.`,
          );
        }
        if (options.mediaSecurity) {
          const scan = options.mediaSecurity.validateUpload({
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            originalName: input.originalName ?? "attachment.bin",
          });
          if (!scan.accepted) {
            throw validationError(scan.reason ?? "Attachment rejected.");
          }
        }
      }

      const message: Message = {
        id: id("msg"),
        conversationId: conversation.id,
        senderId: input.senderId,
        messageType,
        content,
        attachmentUrl: input.attachmentUrl,
        sentAt: isoNow(),
      };
      messages.set(message.id, message);

      const recipientId = otherParticipantId(conversation, input.senderId);
      if (recipientId) {
        receipts.set(receiptKey(message.id, input.senderId), {
          messageId: message.id,
          participantId: input.senderId,
          status: ReceiptStatus.SENT,
          updatedAt: isoNow(),
        });
        receipts.set(receiptKey(message.id, recipientId), {
          messageId: message.id,
          participantId: recipientId,
          status: ReceiptStatus.SENT,
          updatedAt: isoNow(),
        });
        trackInbound(recipientId);
        trackResponse(input.senderId);
      }

      conversations.set(conversation.id, {
        ...conversation,
        updatedAt: isoNow(),
      });

      await publishToParticipants(conversation, "new_message", {
        conversationId: conversation.id,
        message,
      });

      if (recipientId) {
        await notifyUser(
          recipientId,
          "New message",
          content.slice(0, 120) || "You received a new attachment.",
          conversation.bookingId
            ? `/bookings/${conversation.bookingId}`
            : undefined,
        );
      }

      return message;
    },

    async editMessage(input) {
      const existing = messages.get(input.messageId);
      if (!existing || existing.deletedAt) {
        throw notFoundError("Message", input.messageId);
      }
      if (existing.senderId !== input.senderId) {
        throw forbiddenError("Only the sender can edit a message.");
      }
      if (existing.messageType !== MessageType.TEXT) {
        throw validationError("Only text messages can be edited.");
      }
      const content = input.content.trim();
      if (!content) throw validationError("content is required.");
      const updated: Message = {
        ...existing,
        content,
        editedAt: isoNow(),
      };
      messages.set(updated.id, updated);
      const conversation = conversations.get(existing.conversationId);
      if (conversation) {
        await publishToParticipants(conversation, "new_message", {
          conversationId: conversation.id,
          message: updated,
          edited: true,
        });
      }
      return updated;
    },

    async softDeleteMessage(input) {
      const existing = messages.get(input.messageId);
      if (!existing) throw notFoundError("Message", input.messageId);
      if (existing.senderId !== input.senderId) {
        throw forbiddenError("Only the sender can delete a message.");
      }
      const updated: Message = {
        ...existing,
        content: "",
        attachmentUrl: undefined,
        deletedAt: isoNow(),
      };
      messages.set(updated.id, updated);
      return updated;
    },

    async listMessages(conversationId) {
      return [...messages.values()]
        .filter((m) => m.conversationId === conversationId && !m.deletedAt)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
    },

    async markDelivered(input) {
      const message = messages.get(input.messageId);
      if (!message) throw notFoundError("Message", input.messageId);
      await service.assertParticipant(message.conversationId, input.participantId);
      const key = receiptKey(input.messageId, input.participantId);
      const existing = receipts.get(key);
      if (existing?.status === ReceiptStatus.READ) return existing;
      const receipt: MessageReceipt = {
        messageId: input.messageId,
        participantId: input.participantId,
        status: ReceiptStatus.DELIVERED,
        updatedAt: isoNow(),
      };
      receipts.set(key, receipt);
      const conversation = conversations.get(message.conversationId);
      if (conversation) {
        await publishToParticipants(conversation, "read_receipt", {
          conversationId: conversation.id,
          receipt,
        });
      }
      return receipt;
    },

    async markRead(input) {
      const message = messages.get(input.messageId);
      if (!message) throw notFoundError("Message", input.messageId);
      await service.assertParticipant(message.conversationId, input.participantId);
      const receipt: MessageReceipt = {
        messageId: input.messageId,
        participantId: input.participantId,
        status: ReceiptStatus.READ,
        updatedAt: isoNow(),
      };
      receipts.set(receiptKey(input.messageId, input.participantId), receipt);
      const conversation = conversations.get(message.conversationId);
      if (conversation) {
        await publishToParticipants(conversation, "read_receipt", {
          conversationId: conversation.id,
          receipt,
        });
      }
      return receipt;
    },

    async listReceipts(messageId) {
      return [...receipts.values()].filter((r) => r.messageId === messageId);
    },

    async createOffer(input) {
      const conversation = await service.assertParticipant(
        input.conversationId,
        input.senderId,
      );
      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        throw validationError("amount must be a positive number.");
      }
      const offer: NegotiationOffer = {
        id: id("offer"),
        conversationId: conversation.id,
        senderId: input.senderId,
        amount: input.amount,
        currency: input.currency ?? "INR",
        notes: (input.notes ?? "").trim(),
        status: NegotiationOfferStatus.PENDING,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      };
      offers.set(offer.id, offer);
      conversations.set(conversation.id, {
        ...conversation,
        updatedAt: isoNow(),
      });

      await publishToParticipants(conversation, "offer_update", {
        conversationId: conversation.id,
        offer,
      });

      const recipientId = otherParticipantId(conversation, input.senderId);
      if (recipientId) {
        await notifyUser(
          recipientId,
          "New offer",
          `Offer of ${offer.currency} ${offer.amount}`,
          conversation.bookingId
            ? `/bookings/${conversation.bookingId}`
            : undefined,
        );
      }
      return offer;
    },

    async acceptOffer(input) {
      const offer = offers.get(input.offerId);
      if (!offer) throw notFoundError("Offer", input.offerId);
      const conversation = await service.assertParticipant(
        offer.conversationId,
        input.actorUserId,
      );
      if (offer.senderId === input.actorUserId) {
        throw forbiddenError("Cannot accept your own offer.");
      }
      if (!canTransitionOffer(offer.status, NegotiationOfferStatus.ACCEPTED)) {
        throw validationError(`Cannot accept offer in status ${offer.status}.`);
      }
      const updated: NegotiationOffer = {
        ...offer,
        status: NegotiationOfferStatus.ACCEPTED,
        updatedAt: isoNow(),
      };
      offers.set(updated.id, updated);
      await publishToParticipants(conversation, "offer_update", {
        conversationId: conversation.id,
        offer: updated,
      });
      await notifyUser(
        offer.senderId,
        "Offer accepted",
        `Your offer of ${offer.currency} ${offer.amount} was accepted.`,
        conversation.bookingId ? `/bookings/${conversation.bookingId}` : undefined,
      );
      return updated;
    },

    async rejectOffer(input) {
      const offer = offers.get(input.offerId);
      if (!offer) throw notFoundError("Offer", input.offerId);
      const conversation = await service.assertParticipant(
        offer.conversationId,
        input.actorUserId,
      );
      if (offer.senderId === input.actorUserId) {
        throw forbiddenError("Cannot reject your own offer.");
      }
      if (!canTransitionOffer(offer.status, NegotiationOfferStatus.REJECTED)) {
        throw validationError(`Cannot reject offer in status ${offer.status}.`);
      }
      const updated: NegotiationOffer = {
        ...offer,
        status: NegotiationOfferStatus.REJECTED,
        updatedAt: isoNow(),
      };
      offers.set(updated.id, updated);
      await publishToParticipants(conversation, "offer_update", {
        conversationId: conversation.id,
        offer: updated,
      });
      await notifyUser(
        offer.senderId,
        "Offer rejected",
        `Your offer of ${offer.currency} ${offer.amount} was rejected.`,
        conversation.bookingId ? `/bookings/${conversation.bookingId}` : undefined,
      );
      return updated;
    },

    async counterOffer(input) {
      const previous = offers.get(input.offerId);
      if (!previous) throw notFoundError("Offer", input.offerId);
      const conversation = await service.assertParticipant(
        previous.conversationId,
        input.senderId,
      );
      if (previous.senderId === input.senderId) {
        throw forbiddenError("Counter must come from the other participant.");
      }
      if (!canTransitionOffer(previous.status, NegotiationOfferStatus.COUNTERED)) {
        throw validationError(`Cannot counter offer in status ${previous.status}.`);
      }
      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        throw validationError("amount must be a positive number.");
      }

      const countered: NegotiationOffer = {
        ...previous,
        status: NegotiationOfferStatus.COUNTERED,
        updatedAt: isoNow(),
      };
      offers.set(countered.id, countered);

      const offer: NegotiationOffer = {
        id: id("offer"),
        conversationId: conversation.id,
        senderId: input.senderId,
        amount: input.amount,
        currency: input.currency ?? previous.currency,
        notes: (input.notes ?? "").trim(),
        status: NegotiationOfferStatus.PENDING,
        parentOfferId: previous.id,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      };
      offers.set(offer.id, offer);

      await publishToParticipants(conversation, "offer_update", {
        conversationId: conversation.id,
        offer,
        previous: countered,
      });
      await notifyUser(
        previous.senderId,
        "New offer",
        `Counter-offer of ${offer.currency} ${offer.amount}`,
        conversation.bookingId ? `/bookings/${conversation.bookingId}` : undefined,
      );
      return { previous: countered, offer };
    },

    async listOffers(conversationId) {
      return [...offers.values()]
        .filter((o) => o.conversationId === conversationId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async setTyping(input) {
      const conversation = await service.assertParticipant(
        input.conversationId,
        input.userId,
      );
      await publishToParticipants(conversation, "typing_indicator", {
        conversationId: conversation.id,
        userId: input.userId,
        typing: input.typing,
      });
    },

    async getAnalytics(userId) {
      const userMessages = [...messages.values()].filter(
        (m) => m.senderId === userId && !m.deletedAt,
      );
      const userOffers = [...offers.values()].filter((o) => o.senderId === userId);
      const accepted = userOffers.filter(
        (o) => o.status === NegotiationOfferStatus.ACCEPTED,
      ).length;
      const samples = responseSamples.get(userId) ?? [];
      const responseTimeMsAvg =
        samples.length === 0
          ? 0
          : Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
      const expected = inboundExpectingReply.get(userId) ?? 0;
      const responseRate =
        expected === 0
          ? 1
          : Math.min(1, Math.round((userMessages.length / expected) * 1000) / 1000);

      return {
        userId,
        messageCount: userMessages.length,
        responseTimeMsAvg,
        responseRate,
        negotiationSuccessRate:
          userOffers.length === 0
            ? 0
            : Math.round((accepted / userOffers.length) * 1000) / 1000,
        offersSent: userOffers.length,
        offersAccepted: accepted,
      };
    },

    async toChatThread(conversationId) {
      const conversation = conversations.get(conversationId);
      if (!conversation) throw notFoundError("Conversation", conversationId);
      const threadMessages = await service.listMessages(conversationId);
      return {
        id: conversation.id,
        bookingId: conversation.bookingId,
        participants: [
          { userId: conversation.organizerId, role: "host" as const },
          { userId: conversation.performerId, role: "performer" as const },
        ],
        messages: await Promise.all(
          threadMessages.map(async (m) => {
            const readBy = (await service.listReceipts(m.id))
              .filter((r) => r.status === ReceiptStatus.READ)
              .map((r) => r.participantId);
            return {
              id: m.id,
              threadId: conversation.id,
              senderId: m.senderId,
              body:
                m.messageType === MessageType.TEXT
                  ? m.content
                  : `[${m.messageType}] ${m.content || m.attachmentUrl || ""}`,
              sentAt: m.sentAt,
              readBy,
            };
          }),
        ),
        updatedAt: conversation.updatedAt,
      };
    },
  };

  return service;
}

export type { OfferStatus, RecStatus };
