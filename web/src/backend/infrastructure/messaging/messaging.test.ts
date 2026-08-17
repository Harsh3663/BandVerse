import { beforeEach, describe, expect, it } from "vitest";

import {
  canTransitionOffer,
  negotiationOfferTransitions,
} from "@/backend/domain/messaging";
import {
  getBackendContainer,
  resetBackendContainer,
} from "@/backend/infrastructure/container";
import { createMediaSecurityService } from "@/backend/infrastructure/security/media";

describe("negotiation offer state machine", () => {
  it("allows pending → accepted/rejected/countered", () => {
    expect(canTransitionOffer("pending", "accepted")).toBe(true);
    expect(canTransitionOffer("pending", "rejected")).toBe(true);
    expect(canTransitionOffer("pending", "countered")).toBe(true);
    expect(canTransitionOffer("accepted", "rejected")).toBe(false);
    expect(negotiationOfferTransitions.countered).toContain("accepted");
  });
});

describe("messaging service", () => {
  beforeEach(() => {
    process.env.BANDVERSE_PERSISTENCE = "mock";
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    resetBackendContainer();
  });

  it("creates conversations between organizer and performer", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      bookingId: "booking_1",
      eventId: "event_1",
      actorUserId: "org_1",
    });
    expect(conversation.id).toBeTruthy();
    expect(conversation.organizerId).toBe("org_1");
    expect(conversation.performerId).toBe("perf_1");

    const again = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      bookingId: "booking_1",
      actorUserId: "perf_1",
    });
    expect(again.id).toBe(conversation.id);
  });

  it("sends text messages and enforces participant permissions", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });

    const message = await container.messaging.sendMessage({
      conversationId: conversation.id,
      senderId: "org_1",
      messageType: "text",
      content: "Can you do a 90-minute set?",
    });
    expect(message.content).toContain("90-minute");

    await expect(
      container.messaging.sendMessage({
        conversationId: conversation.id,
        senderId: "stranger",
        messageType: "text",
        content: "Hello",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const listed = await container.messaging.listMessages(conversation.id);
    expect(listed).toHaveLength(1);
  });

  it("runs offer lifecycle with history", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });

    const offer = await container.messaging.createOffer({
      conversationId: conversation.id,
      senderId: "org_1",
      amount: 50_000,
      notes: "Base fee",
    });
    expect(offer.status).toBe("pending");

    const countered = await container.messaging.counterOffer({
      offerId: offer.id,
      senderId: "perf_1",
      amount: 65_000,
      notes: "Includes travel",
    });
    expect(countered.previous.status).toBe("countered");
    expect(countered.offer.status).toBe("pending");
    expect(countered.offer.parentOfferId).toBe(offer.id);

    const accepted = await container.messaging.acceptOffer({
      offerId: countered.offer.id,
      actorUserId: "org_1",
    });
    expect(accepted.status).toBe("accepted");

    const history = await container.messaging.listOffers(conversation.id);
    expect(history).toHaveLength(2);
  });

  it("tracks read receipts per participant", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });
    const message = await container.messaging.sendMessage({
      conversationId: conversation.id,
      senderId: "org_1",
      messageType: "text",
      content: "Terms attached soon",
    });

    const delivered = await container.messaging.markDelivered({
      messageId: message.id,
      participantId: "perf_1",
    });
    expect(delivered.status).toBe("delivered");

    const read = await container.messaging.markRead({
      messageId: message.id,
      participantId: "perf_1",
    });
    expect(read.status).toBe("read");

    const receipts = await container.messaging.listReceipts(message.id);
    expect(receipts.some((r) => r.participantId === "perf_1" && r.status === "read")).toBe(
      true,
    );
  });

  it("validates document/image attachments via media security", async () => {
    const container = getBackendContainer();
    const media = createMediaSecurityService();
    expect(
      media.validateUpload({
        mimeType: "application/pdf",
        sizeBytes: 1024,
        originalName: "contract.pdf",
      }).accepted,
    ).toBe(true);
    expect(
      media.validateUpload({
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sizeBytes: 2048,
        originalName: "rider.docx",
      }).accepted,
    ).toBe(true);

    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });

    const doc = await container.messaging.sendMessage({
      conversationId: conversation.id,
      senderId: "org_1",
      messageType: "document",
      content: "Contract draft",
      attachmentUrl: "https://cdn.example.com/contract.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2048,
      originalName: "contract.pdf",
    });
    expect(doc.messageType).toBe("document");

    await expect(
      container.messaging.sendMessage({
        conversationId: conversation.id,
        senderId: "org_1",
        messageType: "document",
        content: "Bad",
        attachmentUrl: "https://cdn.example.com/x.exe",
        mimeType: "application/x-msdownload",
        sizeBytes: 100,
        originalName: "x.exe",
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects offer accept by sender (permissions)", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });
    const offer = await container.messaging.createOffer({
      conversationId: conversation.id,
      senderId: "org_1",
      amount: 10_000,
    });
    await expect(
      container.messaging.acceptOffer({
        offerId: offer.id,
        actorUserId: "org_1",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("computes messaging analytics", async () => {
    const container = getBackendContainer();
    const conversation = await container.messaging.createConversation({
      organizerId: "org_1",
      performerId: "perf_1",
      actorUserId: "org_1",
    });
    await container.messaging.sendMessage({
      conversationId: conversation.id,
      senderId: "org_1",
      messageType: "text",
      content: "Hello",
    });
    const offer = await container.messaging.createOffer({
      conversationId: conversation.id,
      senderId: "org_1",
      amount: 20_000,
    });
    await container.messaging.acceptOffer({
      offerId: offer.id,
      actorUserId: "perf_1",
    });
    const analytics = await container.messaging.getAnalytics("org_1");
    expect(analytics.messageCount).toBeGreaterThanOrEqual(1);
    expect(analytics.offersAccepted).toBe(1);
    expect(analytics.negotiationSuccessRate).toBe(1);
  });
});
