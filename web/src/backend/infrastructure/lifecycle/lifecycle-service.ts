import { randomBytes } from "node:crypto";

import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import { asWritableRepositories } from "@/backend/application/ports/writable";
import {
  assertLifecycleTransition,
  BookingLifecycleStatus,
  type BookingLifecycleRecord,
  type BookingLifecycleStatus as LifecycleStatus,
  type BookingTimelineEntry,
  type LifecycleContract,
} from "@/backend/domain/booking-lifecycle";
import type { QueuePort } from "@/backend/infrastructure/jobs";
import type { PaymentService } from "@/backend/infrastructure/payments";
import { paymentIdempotencyKey } from "@/backend/infrastructure/payments";
import { invalidTransitionError, notFoundError, validationError } from "@/backend/shared/errors";
import type { Application, Booking } from "@/modules/marketplace/types";

export interface LifecycleAnalytics {
  readonly funnel: Record<LifecycleStatus, number>;
  readonly applicationConversionRate: number;
  readonly revenuePaise: number;
  readonly topPerformers: readonly { performerId: string; completed: number; revenuePaise: number }[];
}

export interface LifecycleService {
  createDraft(input: {
    eventId: string;
    hostId: string;
    performerId?: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  invitePerformer(input: {
    eventId: string;
    hostId: string;
    performerId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  apply(input: {
    eventId: string;
    performerId: string;
    hostId: string;
    actorUserId: string;
    message: string;
    quotedPaise: number;
  }): Promise<BookingLifecycleRecord>;
  withdrawApplication(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  acceptInvite(input: {
    lifecycleId: string;
    actorUserId: string;
    message?: string;
    quotedPaise?: number;
  }): Promise<BookingLifecycleRecord>;
  rejectInvite(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  shortlist(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  startNegotiation(input: {
    lifecycleId: string;
    actorUserId: string;
    agreedPaise?: number;
  }): Promise<BookingLifecycleRecord>;
  confirm(input: {
    lifecycleId: string;
    actorUserId: string;
    agreedPaise: number;
  }): Promise<BookingLifecycleRecord>;
  markAdvancePaid(input: {
    lifecycleId: string;
    actorUserId: string;
    amountPaise: number;
  }): Promise<{ lifecycle: BookingLifecycleRecord; paymentIntent: unknown }>;
  createContract(input: {
    lifecycleId: string;
    actorUserId: string;
    terms: string;
    performanceDate: string;
    durationMinutes: number;
    feePaise: number;
  }): Promise<{ lifecycle: BookingLifecycleRecord; contract: LifecycleContract }>;
  signContract(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  markUpcoming(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  complete(input: {
    lifecycleId: string;
    actorUserId: string;
  }): Promise<BookingLifecycleRecord>;
  cancel(input: {
    lifecycleId: string;
    actorUserId: string;
    reason?: string;
  }): Promise<BookingLifecycleRecord>;
  dispute(input: {
    lifecycleId: string;
    actorUserId: string;
    reason?: string;
  }): Promise<BookingLifecycleRecord>;
  recordBalancePayment(input: {
    lifecycleId: string;
    actorUserId: string;
    amountPaise: number;
  }): Promise<{ lifecycle: BookingLifecycleRecord; paymentIntent: unknown }>;
  refund(input: {
    lifecycleId: string;
    actorUserId: string;
    amountPaise: number;
  }): Promise<{ lifecycle: BookingLifecycleRecord; paymentIntent: unknown }>;
  getById(id: string): Promise<BookingLifecycleRecord | undefined>;
  list(filters?: {
    hostId?: string;
    performerId?: string;
    eventId?: string;
    status?: LifecycleStatus;
  }): Promise<readonly BookingLifecycleRecord[]>;
  timeline(lifecycleId: string): Promise<readonly BookingTimelineEntry[]>;
  getContract(lifecycleId: string): Promise<LifecycleContract | undefined>;
  assertReviewAllowed(bookingId: string): Promise<boolean>;
  analytics(hostId?: string): Promise<LifecycleAnalytics>;
}

function id(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function now(): string {
  return new Date().toISOString();
}

export function createLifecycleService(options: {
  repositories: PlatformRepositories;
  queue: QueuePort;
  payments: PaymentService;
}): LifecycleService {
  const records = new Map<string, BookingLifecycleRecord>();
  const timelines = new Map<string, BookingTimelineEntry[]>();
  const contracts = new Map<string, LifecycleContract>();
  const repos = asWritableRepositories(options.repositories);

  async function notify(template: string, data: Record<string, string>) {
    await options.queue.enqueue("notification.email", {
      to: "ops@bandverse.in",
      template,
      data,
    });
  }

  function appendTimeline(
    lifecycleId: string,
    entry: Omit<BookingTimelineEntry, "id" | "lifecycleId" | "timestamp"> & {
      timestamp?: string;
    },
  ) {
    const row: BookingTimelineEntry = {
      id: id("tl"),
      lifecycleId,
      timestamp: entry.timestamp ?? now(),
      actorUserId: entry.actorUserId,
      action: entry.action,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      metadata: entry.metadata,
    };
    const list = timelines.get(lifecycleId) ?? [];
    list.push(row);
    timelines.set(lifecycleId, list);
    return row;
  }

  async function transition(
    record: BookingLifecycleRecord,
    to: LifecycleStatus,
    actorUserId: string,
    action: string,
    patch?: Partial<BookingLifecycleRecord>,
  ): Promise<BookingLifecycleRecord> {
    try {
      assertLifecycleTransition(record.status, to);
    } catch {
      throw invalidTransitionError("booking_lifecycle", record.status, to);
    }
    const updated: BookingLifecycleRecord = {
      ...record,
      ...patch,
      status: to,
      updatedAt: now(),
      version: record.version + 1,
    };
    records.set(updated.id, updated);
    appendTimeline(updated.id, {
      actorUserId,
      action,
      fromStatus: record.status,
      toStatus: to,
      metadata: patch as Record<string, unknown> | undefined,
    });
    await notify(`lifecycle.${action}`, {
      lifecycleId: updated.id,
      status: updated.status,
      eventId: updated.eventId,
      performerId: updated.performerId,
    });
    await options.queue.enqueue("booking.process", {
      bookingId: updated.bookingId ?? updated.id,
    });
    return updated;
  }

  return {
    async createDraft(input) {
      const record: BookingLifecycleRecord = {
        id: id("lc"),
        eventId: input.eventId,
        performerId: input.performerId ?? "",
        hostId: input.hostId,
        status: BookingLifecycleStatus.DRAFT,
        currency: "INR",
        createdAt: now(),
        updatedAt: now(),
        version: 1,
      };
      records.set(record.id, record);
      appendTimeline(record.id, {
        actorUserId: input.actorUserId,
        action: "draft.created",
        toStatus: BookingLifecycleStatus.DRAFT,
      });
      return record;
    },

    async invitePerformer(input) {
      const existing = [...records.values()].find(
        (row) =>
          row.eventId === input.eventId &&
          row.performerId === input.performerId &&
          row.status !== BookingLifecycleStatus.CANCELLED,
      );
      if (existing) return existing;

      const draft = await this.createDraft({
        eventId: input.eventId,
        hostId: input.hostId,
        performerId: input.performerId,
        actorUserId: input.actorUserId,
      });
      return transition(
        { ...draft, performerId: input.performerId },
        BookingLifecycleStatus.INVITED,
        input.actorUserId,
        "invite.sent",
        { performerId: input.performerId },
      );
    },

    async apply(input) {
      const event = await options.repositories.events.getById(input.eventId);
      if (!event) throw notFoundError("Event", input.eventId);

      const application: Application = {
        id: id("application"),
        eventId: input.eventId,
        performerId: input.performerId,
        quotedPrice: { amount: input.quotedPaise / 100, currency: "INR" },
        message: input.message,
        status: "submitted",
        submittedAt: now(),
        updatedAt: now(),
      };
      const createdApp = await repos.applications.create(application);

      let record = [...records.values()].find(
        (row) =>
          row.eventId === input.eventId &&
          row.performerId === input.performerId &&
          row.status === BookingLifecycleStatus.INVITED,
      );
      if (!record) {
        record = {
          id: id("lc"),
          eventId: input.eventId,
          performerId: input.performerId,
          hostId: input.hostId || event.hostId,
          applicationId: createdApp.id,
          status: BookingLifecycleStatus.DRAFT,
          currency: "INR",
          agreedPaise: input.quotedPaise,
          createdAt: now(),
          updatedAt: now(),
          version: 1,
        };
        records.set(record.id, record);
        appendTimeline(record.id, {
          actorUserId: input.actorUserId,
          action: "draft.created",
          toStatus: BookingLifecycleStatus.DRAFT,
        });
      }

      return transition(
        record,
        BookingLifecycleStatus.APPLIED,
        input.actorUserId,
        "application.submitted",
        {
          applicationId: createdApp.id,
          agreedPaise: input.quotedPaise,
          hostId: input.hostId || event.hostId,
        },
      );
    },

    async withdrawApplication(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (record.applicationId) {
        const app = await options.repositories.applications.getById(
          record.applicationId,
        );
        if (app && (app.status === "submitted" || app.status === "shortlisted")) {
          await repos.applications.update({
            ...app,
            status: "withdrawn",
            updatedAt: now(),
          });
        }
      }
      return transition(
        record,
        BookingLifecycleStatus.CANCELLED,
        input.actorUserId,
        "application.withdrawn",
      );
    },

    async acceptInvite(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (record.status !== BookingLifecycleStatus.INVITED) {
        throw invalidTransitionError(
          "booking_lifecycle",
          record.status,
          BookingLifecycleStatus.APPLIED,
        );
      }
      const application: Application = {
        id: id("application"),
        eventId: record.eventId,
        performerId: record.performerId,
        quotedPrice: {
          amount: (input.quotedPaise ?? record.agreedPaise ?? 0) / 100,
          currency: "INR",
        },
        message: input.message ?? "Accepted invitation",
        status: "submitted",
        submittedAt: now(),
        updatedAt: now(),
      };
      const createdApp = await repos.applications.create(application);
      return transition(
        record,
        BookingLifecycleStatus.APPLIED,
        input.actorUserId,
        "invite.accepted",
        {
          applicationId: createdApp.id,
          agreedPaise: input.quotedPaise ?? record.agreedPaise,
        },
      );
    },

    async rejectInvite(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      return transition(
        record,
        BookingLifecycleStatus.CANCELLED,
        input.actorUserId,
        "invite.rejected",
      );
    },

    async shortlist(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (record.applicationId) {
        const app = await options.repositories.applications.getById(
          record.applicationId,
        );
        if (app?.status === "submitted") {
          await repos.applications.update({
            ...app,
            status: "shortlisted",
            updatedAt: now(),
          });
        }
      }
      return transition(
        record,
        BookingLifecycleStatus.SHORTLISTED,
        input.actorUserId,
        "application.shortlisted",
      );
    },

    async startNegotiation(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      return transition(
        record,
        BookingLifecycleStatus.NEGOTIATING,
        input.actorUserId,
        "negotiation.started",
        input.agreedPaise != null ? { agreedPaise: input.agreedPaise } : undefined,
      );
    },

    async confirm(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (!record.performerId) {
        throw validationError("Performer required to confirm booking.");
      }

      if (record.applicationId) {
        const app = await options.repositories.applications.getById(
          record.applicationId,
        );
        if (app && (app.status === "submitted" || app.status === "shortlisted")) {
          await repos.applications.update({
            ...app,
            status: "accepted",
            updatedAt: now(),
          });
        }
      }

      const booking: Booking = {
        id: id("booking"),
        eventId: record.eventId,
        performerId: record.performerId,
        hostId: record.hostId,
        applicationId: record.applicationId,
        agreedPrice: { amount: input.agreedPaise / 100, currency: "INR" },
        status: "confirmed",
        requestedAt: now(),
        updatedAt: now(),
      };
      const createdBooking = await repos.bookings.create(booking);

      let current = record;
      if (current.status === BookingLifecycleStatus.APPLIED) {
        current = await transition(
          current,
          BookingLifecycleStatus.SHORTLISTED,
          input.actorUserId,
          "application.shortlisted",
        );
      }
      if (current.status === BookingLifecycleStatus.SHORTLISTED) {
        current = await transition(
          current,
          BookingLifecycleStatus.NEGOTIATING,
          input.actorUserId,
          "negotiation.started",
          { agreedPaise: input.agreedPaise },
        );
      }

      return transition(
        current,
        BookingLifecycleStatus.CONFIRMED,
        input.actorUserId,
        "booking.confirmed",
        {
          bookingId: createdBooking.id,
          agreedPaise: input.agreedPaise,
        },
      );
    },

    async markAdvancePaid(input) {
      const record = records.get(input.lifecycleId);
      if (!record?.bookingId) {
        throw validationError("Confirm booking before advance payment.");
      }
      const intent = await options.payments.createIntent({
        bookingId: record.bookingId,
        amount: { amount: input.amountPaise / 100, currency: "INR" },
        kind: "advance",
        idempotencyKey: paymentIdempotencyKey({
          bookingId: record.bookingId,
          kind: "advance",
          amount: input.amountPaise / 100,
        }),
      });
      // Sandbox path stays pending at provider; lifecycle marks advance paid on organizer confirm of funds.
      const updated = await transition(
        record,
        BookingLifecycleStatus.ADVANCE_PAID,
        input.actorUserId,
        "payment.advance_paid",
        { advancePaymentId: intent.providerReference },
      );
      return { lifecycle: updated, paymentIntent: intent };
    },

    async createContract(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (
        record.status !== BookingLifecycleStatus.ADVANCE_PAID &&
        record.status !== BookingLifecycleStatus.CONFIRMED
      ) {
        throw validationError("Contract requires confirmed/advance-paid booking.");
      }
      const contract: LifecycleContract = {
        id: id("contract"),
        lifecycleId: record.id,
        bookingId: record.bookingId,
        terms: input.terms,
        performanceDate: input.performanceDate,
        durationMinutes: input.durationMinutes,
        feePaise: input.feePaise,
        currency: "INR",
        status: "draft",
        createdAt: now(),
      };
      contracts.set(record.id, contract);
      appendTimeline(record.id, {
        actorUserId: input.actorUserId,
        action: "contract.created",
        metadata: { contractId: contract.id },
      });
      return { lifecycle: record, contract };
    },

    async signContract(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      const contract = contracts.get(record.id);
      if (!contract) throw notFoundError("Contract", input.lifecycleId);
      contracts.set(record.id, {
        ...contract,
        status: "signed",
        signedAt: now(),
      });
      let current = record;
      if (current.status === BookingLifecycleStatus.CONFIRMED) {
        current = await transition(
          current,
          BookingLifecycleStatus.ADVANCE_PAID,
          input.actorUserId,
          "payment.advance_paid",
        );
      }
      current = await transition(
        current,
        BookingLifecycleStatus.CONTRACT_SIGNED,
        input.actorUserId,
        "contract.signed",
        { contractId: contract.id },
      );
      return transition(
        current,
        BookingLifecycleStatus.UPCOMING,
        input.actorUserId,
        "booking.upcoming",
      );
    },

    async markUpcoming(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      return transition(
        record,
        BookingLifecycleStatus.UPCOMING,
        input.actorUserId,
        "booking.upcoming",
      );
    },

    async complete(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      if (record.bookingId) {
        const booking = await options.repositories.bookings.getById(
          record.bookingId,
        );
        if (booking) {
          await repos.bookings.update({
            ...booking,
            status: "completed",
            updatedAt: now(),
          });
        }
      }
      return transition(
        record,
        BookingLifecycleStatus.COMPLETED,
        input.actorUserId,
        "booking.completed",
      );
    },

    async cancel(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      return transition(
        record,
        BookingLifecycleStatus.CANCELLED,
        input.actorUserId,
        "booking.cancelled",
        undefined,
      );
    },

    async dispute(input) {
      const record = records.get(input.lifecycleId);
      if (!record) throw notFoundError("Lifecycle", input.lifecycleId);
      return transition(
        record,
        BookingLifecycleStatus.DISPUTED,
        input.actorUserId,
        "booking.disputed",
        undefined,
      );
    },

    async recordBalancePayment(input) {
      const record = records.get(input.lifecycleId);
      if (!record?.bookingId) {
        throw validationError("Booking required for balance payment.");
      }
      const intent = await options.payments.createIntent({
        bookingId: record.bookingId,
        amount: { amount: input.amountPaise / 100, currency: "INR" },
        kind: "balance",
        idempotencyKey: paymentIdempotencyKey({
          bookingId: record.bookingId,
          kind: "balance",
          amount: input.amountPaise / 100,
        }),
      });
      const updated: BookingLifecycleRecord = {
        ...record,
        balancePaymentId: intent.providerReference,
        updatedAt: now(),
        version: record.version + 1,
      };
      records.set(updated.id, updated);
      appendTimeline(updated.id, {
        actorUserId: input.actorUserId,
        action: "payment.balance_initiated",
        metadata: { providerReference: intent.providerReference },
      });
      await notify("lifecycle.payment.balance", {
        lifecycleId: updated.id,
        bookingId: record.bookingId,
      });
      return { lifecycle: updated, paymentIntent: intent };
    },

    async refund(input) {
      const record = records.get(input.lifecycleId);
      if (!record?.bookingId) {
        throw validationError("Booking required for refund.");
      }
      const intent = await options.payments.createIntent({
        bookingId: record.bookingId,
        amount: { amount: input.amountPaise / 100, currency: "INR" },
        kind: "refund",
        idempotencyKey: paymentIdempotencyKey({
          bookingId: record.bookingId,
          kind: "refund",
          amount: input.amountPaise / 100,
        }),
      });
      const updated: BookingLifecycleRecord = {
        ...record,
        refundPaymentId: intent.providerReference,
        updatedAt: now(),
        version: record.version + 1,
      };
      records.set(updated.id, updated);
      appendTimeline(updated.id, {
        actorUserId: input.actorUserId,
        action: "payment.refund_initiated",
        metadata: { providerReference: intent.providerReference },
      });
      await notify("lifecycle.payment.refund", {
        lifecycleId: updated.id,
        bookingId: record.bookingId,
      });
      return { lifecycle: updated, paymentIntent: intent };
    },

    async getById(lifecycleId) {
      return records.get(lifecycleId);
    },

    async list(filters) {
      return [...records.values()].filter((row) => {
        if (filters?.hostId && row.hostId !== filters.hostId) return false;
        if (filters?.performerId && row.performerId !== filters.performerId) {
          return false;
        }
        if (filters?.eventId && row.eventId !== filters.eventId) return false;
        if (filters?.status && row.status !== filters.status) return false;
        return true;
      });
    },

    async timeline(lifecycleId) {
      return timelines.get(lifecycleId) ?? [];
    },

    async getContract(lifecycleId) {
      return contracts.get(lifecycleId);
    },

    async assertReviewAllowed(bookingId) {
      const record = [...records.values()].find((row) => row.bookingId === bookingId);
      if (record) return record.status === BookingLifecycleStatus.COMPLETED;
      const booking = await options.repositories.bookings.getById(bookingId);
      return booking?.status === "completed" || booking?.status === "reviewed";
    },

    async analytics(hostId) {
      const rows = [...records.values()].filter((row) =>
        hostId ? row.hostId === hostId : true,
      );
      const funnel = Object.fromEntries(
        Object.values(BookingLifecycleStatus).map((status) => [
          status,
          rows.filter((row) => row.status === status).length,
        ]),
      ) as Record<LifecycleStatus, number>;

      const applied = rows.filter((row) =>
        [
          BookingLifecycleStatus.APPLIED,
          BookingLifecycleStatus.SHORTLISTED,
          BookingLifecycleStatus.NEGOTIATING,
          BookingLifecycleStatus.CONFIRMED,
          BookingLifecycleStatus.ADVANCE_PAID,
          BookingLifecycleStatus.CONTRACT_SIGNED,
          BookingLifecycleStatus.UPCOMING,
          BookingLifecycleStatus.COMPLETED,
        ].includes(row.status as typeof BookingLifecycleStatus.APPLIED),
      ).length;
      const confirmed = rows.filter((row) =>
        [
          BookingLifecycleStatus.CONFIRMED,
          BookingLifecycleStatus.ADVANCE_PAID,
          BookingLifecycleStatus.CONTRACT_SIGNED,
          BookingLifecycleStatus.UPCOMING,
          BookingLifecycleStatus.COMPLETED,
        ].includes(row.status as typeof BookingLifecycleStatus.CONFIRMED),
      ).length;

      const completed = rows.filter(
        (row) => row.status === BookingLifecycleStatus.COMPLETED,
      );
      const revenuePaise = completed.reduce(
        (sum, row) => sum + (row.agreedPaise ?? 0),
        0,
      );

      const byPerformer = new Map<string, { completed: number; revenuePaise: number }>();
      for (const row of completed) {
        const current = byPerformer.get(row.performerId) ?? {
          completed: 0,
          revenuePaise: 0,
        };
        current.completed += 1;
        current.revenuePaise += row.agreedPaise ?? 0;
        byPerformer.set(row.performerId, current);
      }

      const topPerformers = [...byPerformer.entries()]
        .map(([performerId, stats]) => ({ performerId, ...stats }))
        .sort((a, b) => b.revenuePaise - a.revenuePaise)
        .slice(0, 10);

      return {
        funnel,
        applicationConversionRate: applied === 0 ? 0 : confirmed / applied,
        revenuePaise,
        topPerformers,
      };
    },
  };
}
