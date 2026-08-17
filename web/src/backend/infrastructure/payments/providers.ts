import { createHmac, timingSafeEqual } from "node:crypto";

import { unauthorizedError, validationError } from "@/backend/shared/errors";
import type {
  CreatePaymentIntentInput,
  NormalizedWebhookEvent,
  PaymentIntentResult,
  PaymentProvider,
  WebhookVerificationInput,
} from "./types";

function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isPlaceholder(value: string | undefined, needles: string[]): boolean {
  if (!value?.trim()) return true;
  return needles.some((needle) => value.includes(needle));
}

function assertLiveSecrets(provider: string, ok: boolean): void {
  if (ok) return;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.BANDVERSE_PAYMENT_SANDBOX !== "true"
  ) {
    throw validationError(
      `${provider} credentials missing. Set live keys or BANDVERSE_PAYMENT_SANDBOX=true explicitly.`,
    );
  }
}

function sandboxAllowed(): boolean {
  const env = process.env.NODE_ENV;
  return (
    process.env.BANDVERSE_PAYMENT_SANDBOX === "true" ||
    env !== "production" ||
    process.env.VITEST === "true"
  );
}

export function createRazorpayProvider(options?: {
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
}): PaymentProvider {
  const keyId = options?.keyId ?? process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = options?.keySecret ?? process.env.RAZORPAY_KEY_SECRET ?? "";
  const webhookSecret =
    options?.webhookSecret ?? process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const live =
    !isPlaceholder(keyId, ["placeholder", "rzp_test_placeholder"]) &&
    !isPlaceholder(keySecret, ["placeholder", "rzp_secret_placeholder"]) &&
    Boolean(webhookSecret);

  return {
    name: "razorpay",
    async createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
      assertLiveSecrets("Razorpay", live || sandboxAllowed());
      if (live && !sandboxAllowed()) {
        const amountPaise = Math.round(input.amount.amount * 100);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const response = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            "Idempotency-Key": input.idempotencyKey,
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: input.amount.currency,
            receipt: input.idempotencyKey.slice(0, 40),
            notes: { bookingId: input.bookingId, kind: input.kind },
          }),
        });
        if (!response.ok) {
          throw validationError(`Razorpay order failed (${response.status}).`);
        }
        const order = (await response.json()) as { id: string; status?: string };
        return {
          provider: "razorpay",
          providerReference: order.id,
          checkoutUrl: `https://checkout.razorpay.com/v1/checkout.js#order=${order.id}&key=${keyId}`,
          status: "pending",
        };
      }
      // Explicit sandbox only — never mark paid.
      const providerReference = `rzp_sandbox_${input.idempotencyKey}`;
      return {
        provider: "razorpay",
        providerReference,
        checkoutUrl: `https://checkout.razorpay.com/v1/checkout.js#order=${providerReference}&key=${keyId || "rzp_sandbox"}`,
        status: "pending",
      };
    },
    async verifyWebhook(input: WebhookVerificationInput): Promise<NormalizedWebhookEvent> {
      const secret = webhookSecret || keySecret;
      if (!secret) throw unauthorizedError("Razorpay webhook secret not configured.");
      const digest = createHmac("sha256", secret).update(input.rawBody).digest("hex");
      if (!safeCompare(digest, input.signature)) {
        throw unauthorizedError("Invalid Razorpay webhook signature.");
      }
      const payload = JSON.parse(input.rawBody) as {
        event: string;
        payload?: {
          payment?: { entity?: { id?: string; amount?: number; status?: string } };
          refund?: { entity?: { id?: string; amount?: number; status?: string; payment_id?: string } };
        };
      };
      const payment = payload.payload?.payment?.entity;
      const refund = payload.payload?.refund?.entity;
      if (payload.event.startsWith("refund.")) {
        return {
          provider: "razorpay",
          eventType: payload.event,
          providerReference: refund?.payment_id ?? refund?.id ?? "unknown",
          status: refund?.status === "processed" ? "refunded" : "pending",
          idempotencyKey: `razorpay:${payload.event}:${refund?.id ?? "unknown"}`,
          amount:
            refund?.amount != null
              ? { amount: refund.amount / 100, currency: "INR" }
              : undefined,
          raw: payload,
        };
      }
      return {
        provider: "razorpay",
        eventType: payload.event,
        providerReference: payment?.id ?? "unknown",
        status: payment?.status === "captured" ? "paid" : "pending",
        idempotencyKey: `razorpay:${payload.event}:${payment?.id ?? "unknown"}`,
        amount:
          payment?.amount != null
            ? { amount: payment.amount / 100, currency: "INR" }
            : undefined,
        raw: payload,
      };
    },
    async reconcile(providerReference: string): Promise<PaymentIntentResult> {
      assertLiveSecrets("Razorpay", live || sandboxAllowed());
      if (live && !sandboxAllowed() && !providerReference.startsWith("rzp_sandbox_")) {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const response = await fetch(
          `https://api.razorpay.com/v1/orders/${providerReference}`,
          { headers: { Authorization: `Basic ${auth}` } },
        );
        if (!response.ok) {
          return { provider: "razorpay", providerReference, status: "pending" };
        }
        const order = (await response.json()) as { id: string; status?: string };
        const status =
          order.status === "paid"
            ? "paid"
            : order.status === "attempted"
              ? "pending"
              : "pending";
        return { provider: "razorpay", providerReference: order.id, status };
      }
      // Sandbox: never auto-mark paid.
      return { provider: "razorpay", providerReference, status: "pending" };
    },
  };
}

export function createStripeProvider(options?: {
  secretKey?: string;
  webhookSecret?: string;
}): PaymentProvider {
  const secretKey = options?.secretKey ?? process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret =
    options?.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const live =
    !isPlaceholder(secretKey, ["placeholder", "sk_test_placeholder"]) &&
    Boolean(webhookSecret);

  return {
    name: "stripe",
    async createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
      assertLiveSecrets("Stripe", live || sandboxAllowed());
      if (live && !sandboxAllowed()) {
        const amount = Math.round(input.amount.amount * 100);
        const body = new URLSearchParams({
          amount: String(amount),
          currency: input.amount.currency.toLowerCase(),
          "metadata[bookingId]": input.bookingId,
          "metadata[kind]": input.kind,
          "metadata[idempotencyKey]": input.idempotencyKey,
        });
        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": input.idempotencyKey,
          },
          body,
        });
        if (!response.ok) {
          throw validationError(`Stripe PaymentIntent failed (${response.status}).`);
        }
        const pi = (await response.json()) as {
          id: string;
          client_secret?: string;
          status?: string;
        };
        return {
          provider: "stripe",
          providerReference: pi.id,
          clientSecret: pi.client_secret,
          status: "pending",
        };
      }
      const providerReference = `pi_sandbox_${input.idempotencyKey}`;
      return {
        provider: "stripe",
        providerReference,
        clientSecret: `${providerReference}_secret_sandbox`,
        status: "pending",
      };
    },
    async verifyWebhook(input: WebhookVerificationInput): Promise<NormalizedWebhookEvent> {
      if (!webhookSecret) {
        throw unauthorizedError("Stripe webhook secret not configured.");
      }
      const timestamp = input.timestamp ?? "";
      const signedPayload = `${timestamp}.${input.rawBody}`;
      const digest = createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");
      const parts = input.signature.split(",").map((part) => part.trim());
      const v1 = parts.find((part) => part.startsWith("v1="))?.slice(3);
      if (!v1 || !safeCompare(v1, digest)) {
        throw unauthorizedError("Invalid Stripe webhook signature.");
      }
      if (timestamp) {
        const age = Math.abs(Date.now() / 1000 - Number(timestamp));
        if (Number.isFinite(age) && age > 300) {
          throw unauthorizedError("Stripe webhook timestamp outside tolerance.");
        }
      }
      const payload = JSON.parse(input.rawBody) as {
        type: string;
        data?: {
          object?: {
            id?: string;
            amount_received?: number;
            amount?: number;
            status?: string;
            payment_intent?: string;
          };
        };
      };
      const object = payload.data?.object;
      const isRefund = payload.type.startsWith("charge.refund");
      return {
        provider: "stripe",
        eventType: payload.type,
        providerReference:
          object?.payment_intent ?? object?.id ?? "unknown",
        status: isRefund
          ? "refunded"
          : object?.status === "succeeded"
            ? "paid"
            : "pending",
        idempotencyKey: `stripe:${payload.type}:${object?.id ?? "unknown"}`,
        amount:
          object?.amount_received != null
            ? { amount: object.amount_received / 100, currency: "INR" }
            : object?.amount != null
              ? { amount: object.amount / 100, currency: "INR" }
              : undefined,
        raw: payload,
      };
    },
    async reconcile(providerReference: string): Promise<PaymentIntentResult> {
      assertLiveSecrets("Stripe", live || sandboxAllowed());
      if (live && !sandboxAllowed() && !providerReference.startsWith("pi_sandbox_")) {
        const response = await fetch(
          `https://api.stripe.com/v1/payment_intents/${providerReference}`,
          { headers: { Authorization: `Bearer ${secretKey}` } },
        );
        if (!response.ok) {
          return { provider: "stripe", providerReference, status: "pending" };
        }
        const pi = (await response.json()) as { id: string; status?: string };
        return {
          provider: "stripe",
          providerReference: pi.id,
          status: pi.status === "succeeded" ? "paid" : "pending",
        };
      }
      return { provider: "stripe", providerReference, status: "pending" };
    },
  };
}

export function resolvePaymentProvider(
  name: "razorpay" | "stripe" | "manual" = (process.env.PAYMENT_PROVIDER as
    | "razorpay"
    | "stripe"
    | undefined) ?? "razorpay",
): PaymentProvider {
  if (name === "stripe") return createStripeProvider();
  return createRazorpayProvider();
}
