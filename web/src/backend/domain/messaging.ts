/**
 * Internal messaging & negotiation domain.
 * Separate from marketplace ChatThread UI types and legacy OfferStatus.
 */

export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  DOCUMENT: "document",
  AUDIO: "audio",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const NegotiationOfferStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COUNTERED: "countered",
} as const;

export type NegotiationOfferStatus =
  (typeof NegotiationOfferStatus)[keyof typeof NegotiationOfferStatus];

export const ReceiptStatus = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
} as const;

export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus];

export const ParticipantRole = {
  ORGANIZER: "organizer",
  PERFORMER: "performer",
} as const;

export type ParticipantRole =
  (typeof ParticipantRole)[keyof typeof ParticipantRole];

export interface ConversationParticipant {
  readonly userId: string;
  readonly role: ParticipantRole;
}

export interface Conversation {
  readonly id: string;
  readonly organizerId: string;
  readonly performerId: string;
  readonly bookingId?: string;
  readonly eventId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly messageType: MessageType;
  readonly content: string;
  readonly attachmentUrl?: string;
  readonly sentAt: string;
  readonly editedAt?: string;
  readonly deletedAt?: string;
}

export interface NegotiationOffer {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly notes: string;
  readonly status: NegotiationOfferStatus;
  readonly parentOfferId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MessageReceipt {
  readonly messageId: string;
  readonly participantId: string;
  readonly status: ReceiptStatus;
  readonly updatedAt: string;
}

export interface MessagingAnalytics {
  readonly userId: string;
  readonly messageCount: number;
  readonly responseTimeMsAvg: number;
  readonly responseRate: number;
  readonly negotiationSuccessRate: number;
  readonly offersSent: number;
  readonly offersAccepted: number;
}

export const negotiationOfferTransitions = {
  pending: ["accepted", "rejected", "countered"],
  accepted: [],
  rejected: [],
  countered: ["accepted", "rejected", "countered"],
} as const satisfies Record<
  NegotiationOfferStatus,
  readonly NegotiationOfferStatus[]
>;

export function canTransitionOffer(
  from: NegotiationOfferStatus,
  to: NegotiationOfferStatus,
): boolean {
  return (
    negotiationOfferTransitions[from] as readonly NegotiationOfferStatus[]
  ).includes(to);
}

export function isMessageType(value: string): value is MessageType {
  return Object.values(MessageType).includes(value as MessageType);
}

export function isParticipant(
  conversation: Conversation,
  userId: string,
): boolean {
  return (
    conversation.organizerId === userId || conversation.performerId === userId
  );
}

export function otherParticipantId(
  conversation: Conversation,
  userId: string,
): string | undefined {
  if (conversation.organizerId === userId) return conversation.performerId;
  if (conversation.performerId === userId) return conversation.organizerId;
  return undefined;
}
