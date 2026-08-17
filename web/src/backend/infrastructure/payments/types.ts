import type { Money } from "@/backend/shared/types";

export type PaymentProviderName = "razorpay" | "stripe" | "manual";

export interface CreatePaymentIntentInput {
  readonly bookingId: string;
  readonly amount: Money;
  readonly kind: "advance" | "balance" | "refund";
  readonly customerEmail?: string;
  readonly idempotencyKey: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface PaymentIntentResult {
  readonly provider: PaymentProviderName;
  readonly providerReference: string;
  readonly clientSecret?: string;
  readonly checkoutUrl?: string;
  readonly status: "pending" | "authorized" | "paid" | "failed";
}

export interface WebhookVerificationInput {
  readonly rawBody: string;
  readonly signature: string;
  readonly timestamp?: string;
}

export interface NormalizedWebhookEvent {
  readonly provider: PaymentProviderName;
  readonly eventType: string;
  readonly providerReference: string;
  readonly status: "pending" | "authorized" | "paid" | "failed" | "refunded";
  readonly idempotencyKey: string;
  readonly amount?: Money;
  readonly raw: unknown;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(input: WebhookVerificationInput): Promise<NormalizedWebhookEvent>;
  reconcile(providerReference: string): Promise<PaymentIntentResult>;
}
