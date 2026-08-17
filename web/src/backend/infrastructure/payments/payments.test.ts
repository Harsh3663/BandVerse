import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";

import { createMemoryJobSystem } from "@/backend/infrastructure/jobs";
import { createPaymentService, createRazorpayProvider } from "./index";

describe("payment service", () => {
  it("creates intents and verifies razorpay webhooks idempotently", async () => {
    process.env.BANDVERSE_PAYMENT_SANDBOX = "true";
    const { queue } = createMemoryJobSystem();
    const provider = createRazorpayProvider({
      keyId: "rzp_test_sandbox",
      keySecret: "rzp_secret_sandbox",
      webhookSecret: "whsec",
    });
    const payments = createPaymentService({ queue, provider });

    const intent = await payments.createIntent({
      bookingId: "booking-1",
      amount: { amount: 1000, currency: "INR" },
      kind: "advance",
      idempotencyKey: "idem-1",
    });
    expect(intent.provider).toBe("razorpay");

    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_1", amount: 100000, status: "captured" } } },
    });
    const signature = createHmac("sha256", "whsec").update(rawBody).digest("hex");
    const first = await payments.handleWebhook({ rawBody, signature });
    const second = await payments.handleWebhook({ rawBody, signature });
    expect(first.status).toBe("paid");
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
  });
});
