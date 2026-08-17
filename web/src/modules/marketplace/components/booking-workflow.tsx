"use client";

import { Check, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatMoney,
  titleCase,
} from "../format";
import {
  bookingTransitions,
  canTransitionBooking,
  transitionBooking,
} from "../state-machines";
import type {
  AvailabilityCalendar,
  Booking,
  BookingRequestInput,
  BookingStatus,
  CalendarEntry,
  ChatMessage,
  ChatThread,
  EntityId,
  EventTypeDefinition,
  MarketplaceEvent,
  Money,
  PaymentPlaceholder,
  PerformerProfile,
  PricingPackage,
  Review,
  VenueProfile,
} from "../types";
import { MarketplaceAvailabilityCalendar } from "./availability-calendar";

const bookingSteps = [
  "Date",
  "Time",
  "Venue",
  "Event Type",
  "Audience Size",
  "Budget",
  "Special Requirements",
  "Review",
  "Submit",
  "Confirmation",
] as const;

interface BookingDraft {
  eventDate: string;
  startTime: string;
  endTime: string;
  venueId: string;
  eventTypeId: string;
  audienceSize: string;
  packageId: string;
  budget: string;
  specialRequirements: string;
}

export interface BookingWizardProps {
  performer: PerformerProfile;
  eventTypes: readonly EventTypeDefinition[];
  venues: readonly VenueProfile[];
  calendarEntries?: readonly CalendarEntry[];
  initialEventType?: string;
  initialDate?: string;
  confirmationReferencePrefix?: string;
}

export function BookingWizard({
  performer,
  eventTypes,
  venues,
  calendarEntries = [],
  initialEventType,
  initialDate,
  confirmationReferencePrefix = "DEMO",
}: BookingWizardProps) {
  const firstPackage = performer.pricingPackages[0];
  const supportedEventTypes = eventTypes.filter((eventType) =>
    performer.supportedEventTypeIds.includes(eventType.id),
  );
  const availableEventTypes = supportedEventTypes.length
    ? supportedEventTypes
    : eventTypes;
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState<BookingRequestInput>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [draft, setDraft] = useState<BookingDraft>({
    eventDate: initialDate ?? "",
    startTime: "18:00",
    endTime: "21:00",
    venueId: "",
    eventTypeId: initialEventType ?? "",
    audienceSize: "",
    packageId: firstPackage?.id ?? "",
    budget: firstPackage ? String(firstPackage.price.amount) : "",
    specialRequirements: "",
  });

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const selectedVenue = venues.find((venue) => venue.id === draft.venueId);
  const selectedEventType = eventTypes.find(
    (eventType) => eventType.id === draft.eventTypeId,
  );
  const selectedPackage = performer.pricingPackages.find(
    (item) => item.id === draft.packageId,
  );

  function update<Key extends keyof BookingDraft>(key: Key, value: BookingDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function next() {
    const message = validateStep(step, draft);
    if (message) {
      setError(message);
      return;
    }
    setStep((current) => Math.min(current + 1, bookingSteps.length - 1));
  }

  async function submitRequest() {
    setPending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const input: BookingRequestInput = {
      performerId: performer.id,
      eventTypeId: draft.eventTypeId,
      eventDate: draft.eventDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      venueId: draft.venueId,
      venueName: selectedVenue?.name ?? "",
      city: selectedVenue?.location.city ?? "",
      audienceSize: Number(draft.audienceSize),
      packageId: draft.packageId || undefined,
      budget: { amount: Number(draft.budget), currency: "INR" },
      specialRequirements: draft.specialRequirements,
    };
    setSubmittedRequest(input);
    setPending(false);
    setStep(9);
  }

  if (step === 9 && submittedRequest) {
    return (
      <div className="space-y-4">
        <p className="sr-only" aria-live="assertive">
          Booking request submitted.
        </p>
        <BookingConfirmation
          title={`Request sent to ${performer.displayName}`}
          reference={`${confirmationReferencePrefix}-${performer.id}`}
        />
        <p className="text-muted-foreground text-sm">
          Frontend mock confirmation only. No booking was persisted and no payment was
          collected.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="min-w-0">
        <CardHeader>
          <p className="text-muted-foreground text-sm">
            Step {step + 1} of {bookingSteps.length}
          </p>
          <CardTitle ref={headingRef} tabIndex={-1} className="text-xl outline-none">
            {bookingSteps[step]}
          </CardTitle>
          <ol
            className="mt-3 grid grid-cols-2 gap-1 text-xs sm:grid-cols-5"
            aria-label="Booking progress"
          >
            {bookingSteps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? "step" : undefined}
                className={`rounded px-2 py-1.5 ${
                  index === step
                    ? "bg-primary text-primary-foreground font-medium"
                    : index < step
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </li>
            ))}
          </ol>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 0 ? (
            <MarketplaceAvailabilityCalendar
              availability={performer.availability}
              entries={calendarEntries}
              initialMonth={draft.eventDate || undefined}
              selectedDate={draft.eventDate || undefined}
              onDateSelect={(date) => update("eventDate", date)}
              selectable
              title="Choose an available date"
              className="ring-0"
            />
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start time" htmlFor="booking-start-time">
                <Input
                  id="booking-start-time"
                  type="time"
                  value={draft.startTime}
                  onChange={(event) => update("startTime", event.target.value)}
                />
              </Field>
              <Field label="End time" htmlFor="booking-end-time">
                <Input
                  id="booking-end-time"
                  type="time"
                  value={draft.endTime}
                  onChange={(event) => update("endTime", event.target.value)}
                />
              </Field>
            </div>
          ) : null}
          {step === 2 ? (
            <Field label="Venue" htmlFor="booking-venue">
              <select
                id="booking-venue"
                className={controlClass}
                value={draft.venueId}
                onChange={(event) => update("venueId", event.target.value)}
              >
                <option value="">Select a venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} · {venue.location.city}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {step === 3 ? (
            <Field label="Event type" htmlFor="booking-event-type">
              <select
                id="booking-event-type"
                className={controlClass}
                value={draft.eventTypeId}
                onChange={(event) => update("eventTypeId", event.target.value)}
              >
                <option value="">Select an event type</option>
                {availableEventTypes.map((eventType) => (
                  <option key={eventType.id} value={eventType.id}>
                    {eventType.label}
                  </option>
                ))}
              </select>
              {selectedEventType ? (
                <p className="text-muted-foreground text-sm">
                  {selectedEventType.description}
                </p>
              ) : null}
            </Field>
          ) : null}
          {step === 4 ? (
            <Field label="Expected audience size" htmlFor="booking-audience">
              <Input
                id="booking-audience"
                type="number"
                min={1}
                value={draft.audienceSize}
                onChange={(event) => update("audienceSize", event.target.value)}
              />
            </Field>
          ) : null}
          {step === 5 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Package" htmlFor="booking-package">
                <select
                  id="booking-package"
                  className={controlClass}
                  value={draft.packageId}
                  onChange={(event) => {
                    update("packageId", event.target.value);
                    const packageOption = performer.pricingPackages.find(
                      (item) => item.id === event.target.value,
                    );
                    if (packageOption)
                      update("budget", String(packageOption.price.amount));
                  }}
                >
                  <option value="">Custom requirements</option>
                  {performer.pricingPackages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {formatMoney(item.price)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Budget (INR)" htmlFor="booking-budget">
                <Input
                  id="booking-budget"
                  type="number"
                  min={1}
                  value={draft.budget}
                  onChange={(event) => update("budget", event.target.value)}
                />
              </Field>
            </div>
          ) : null}
          {step === 6 ? (
            <Field label="Special requirements" htmlFor="booking-requirements">
              <textarea
                id="booking-requirements"
                rows={5}
                className={controlClass}
                value={draft.specialRequirements}
                onChange={(event) => update("specialRequirements", event.target.value)}
                placeholder="Schedule, repertoire, accessibility, sound, and production needs."
              />
            </Field>
          ) : null}
          {step === 7 || step === 8 ? (
            <BookingRequestReview
              performer={performer}
              draft={draft}
              venue={selectedVenue}
              eventType={selectedEventType}
              packageOption={selectedPackage}
            />
          ) : null}
          {step === 8 ? (
            <div className="bg-muted rounded-lg p-4 text-sm">
              <p className="font-medium">Typed mock submission</p>
              <p className="text-muted-foreground mt-1">
                Submitting shows a frontend confirmation. This can be replaced by an API
                mutation without changing the request shape.
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="text-destructive font-medium" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || pending}
            onClick={() => {
              setError("");
              setStep((current) => Math.max(0, current - 1));
            }}
          >
            Back
          </Button>
          {step === 8 ? (
            <Button type="button" disabled={pending} onClick={() => void submitRequest()}>
              {pending ? "Submitting…" : "Submit booking request"}
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              {step === 7 ? "Continue to submit" : "Next"}
            </Button>
          )}
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <AvailabilityContext
          availability={performer.availability}
          entries={calendarEntries}
        />
        {firstPackage ? <PricingBreakdown packageOption={firstPackage} /> : null}
      </div>
      <p className="sr-only" aria-live="polite">
        Current step: {bookingSteps[step]}. {error}
      </p>
    </div>
  );
}

/** @deprecated Use BookingWizard. */
export const BookingRequestForm = BookingWizard;

function validateStep(step: number, draft: BookingDraft): string {
  if (step === 0 && !draft.eventDate) return "Choose an available event date.";
  if (step === 1 && (!draft.startTime || !draft.endTime))
    return "Enter both a start and end time.";
  if (step === 1 && draft.endTime <= draft.startTime)
    return "End time must be later than start time.";
  if (step === 2 && !draft.venueId) return "Select a venue.";
  if (step === 3 && !draft.eventTypeId) return "Select an event type.";
  if (step === 4 && Number(draft.audienceSize) < 1)
    return "Enter an audience size of at least 1.";
  if (step === 5 && Number(draft.budget) < 1) return "Enter a valid budget.";
  if (step === 6 && !draft.specialRequirements.trim())
    return "Add special requirements, or enter “None”.";
  return "";
}

function BookingRequestReview({
  performer,
  draft,
  venue,
  eventType,
  packageOption,
}: {
  performer: PerformerProfile;
  draft: BookingDraft;
  venue?: VenueProfile;
  eventType?: EventTypeDefinition;
  packageOption?: PricingPackage;
}) {
  const rows = [
    ["Performer", performer.displayName],
    ["Date", draft.eventDate ? formatDate(`${draft.eventDate}T00:00:00Z`) : "—"],
    ["Time", `${draft.startTime}–${draft.endTime}`],
    ["Venue", venue ? `${venue.name}, ${venue.location.city}` : "—"],
    ["Event type", eventType?.label ?? "—"],
    ["Audience", draft.audienceSize],
    ["Package", packageOption?.name ?? "Custom"],
    [
      "Budget",
      draft.budget ? formatMoney({ amount: Number(draft.budget), currency: "INR" }) : "—",
    ],
    ["Special requirements", draft.specialRequirements],
  ] as const;
  return (
    <dl className="divide-border divide-y rounded-lg border">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 p-3 sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BookingStatusTimeline({ status }: { status: BookingStatus }) {
  const terminal = status === "cancelled" || status === "declined";
  const steps: readonly BookingStatus[] = [
    "requested",
    "confirmed",
    "advance-pending",
    "advance-paid",
    "completed",
    "reviewed",
  ];
  const activeIndex = terminal ? 0 : steps.indexOf(status);

  return (
    <section aria-labelledby="booking-status-heading">
      <h2 id="booking-status-heading" className="font-display text-2xl font-semibold">
        Booking status
      </h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <li key={step} className="flex items-center gap-2 sm:flex-col sm:items-start">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {reached ? <Check className="size-4" aria-hidden /> : index + 1}
              </span>
              <span className={reached ? "font-medium" : "text-muted-foreground"}>
                {titleCase(step)}
              </span>
            </li>
          );
        })}
      </ol>
      {terminal ? (
        <p className="text-destructive mt-4 font-medium">This booking was {status}.</p>
      ) : null}
    </section>
  );
}

export function BookingConfirmation({
  title,
  reference,
}: {
  title: string;
  reference: string;
}) {
  return (
    <Card role="status">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="text-primary size-5" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Reference {reference}. Both parties can continue coordination in the contextual
        thread.
      </CardContent>
    </Card>
  );
}

export function AdvancePaymentDemo({
  payment,
  enabled,
  onMarkPaid,
}: {
  payment: PaymentPlaceholder;
  enabled: boolean;
  onMarkPaid: (payment: PaymentPlaceholder) => void | Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="destructive">Demo only · no payment processor</Badge>
        <CardTitle className="mt-2">Advance payment placeholder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-display text-3xl font-semibold">
          {formatMoney(payment.amount)}
        </p>
        <p className="text-muted-foreground">
          Status: {titleCase(payment.status)}
          {payment.dueAt ? ` · Due ${formatDateTime(payment.dueAt)}` : ""}
        </p>
        <p className="text-muted-foreground text-sm">
          This control simulates a status callback. It does not collect details or move
          money.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          disabled={!enabled}
          onClick={() => void onMarkPaid(payment)}
        >
          Simulate advance paid
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CompletionReviewSubmission({
  booking,
  onComplete,
  onReviewSubmit,
}: {
  booking: Booking;
  onComplete: () => void | Promise<void>;
  onReviewSubmit: (
    review: Pick<Review, "rating" | "title" | "comment">,
  ) => void | Promise<void>;
}) {
  const [submitted, setSubmitted] = useState(false);

  if (booking.status === "advance-paid") {
    return (
      <Button type="button" onClick={() => void onComplete()}>
        Mark event completed
      </Button>
    );
  }
  if (booking.status === "reviewed" || submitted) {
    return (
      <p role="status" className="text-primary font-medium">
        Verified-booking review submitted.
      </p>
    );
  }
  if (booking.status !== "completed") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onReviewSubmit({
      rating: Number(data.get("rating")) as Review["rating"],
      title: String(data.get("title") || ""),
      comment: String(data.get("comment")),
    });
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a verified review</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Rating" htmlFor="review-rating">
            <select
              id="review-rating"
              name="rating"
              className={controlClass}
              defaultValue="5"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars
                </option>
              ))}
            </select>
          </Field>
          <Field label="Title" htmlFor="review-title">
            <Input id="review-title" name="title" />
          </Field>
          <Field label="Review" htmlFor="review-comment">
            <textarea
              id="review-comment"
              name="comment"
              rows={4}
              required
              className={controlClass}
            />
          </Field>
          <Button type="submit">Submit verified review</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AvailabilityContext({
  availability,
  entries = [],
}: {
  availability: AvailabilityCalendar;
  entries?: readonly CalendarEntry[];
}) {
  return (
    <MarketplaceAvailabilityCalendar
      availability={availability}
      entries={entries}
      initialMonth={entries[0]?.startsAt.slice(0, 10)}
      title="Availability context"
    />
  );
}

export function PricingBreakdown({
  packageOption,
  agreedPrice,
  advancePercent = 30,
}: {
  packageOption?: PricingPackage;
  agreedPrice?: Money;
  advancePercent?: number;
}) {
  const total = agreedPrice ?? packageOption?.price;
  if (!total) return null;
  const advance = { ...total, amount: Math.round((total.amount * advancePercent) / 100) };
  const balance = { ...total, amount: total.amount - advance.amount };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {packageOption ? (
            <PriceRow
              label={`${packageOption.name} · ${formatDuration(packageOption.durationMinutes)}`}
              value={formatMoney(total)}
            />
          ) : null}
          <PriceRow label={`Advance (${advancePercent}%)`} value={formatMoney(advance)} />
          <PriceRow label="Balance after advance" value={formatMoney(balance)} />
          <div className="border-border border-t pt-3">
            <PriceRow label="Agreed total" value={formatMoney(total)} strong />
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function ContextualChatThread({
  thread,
  currentUserId,
  onSend,
}: {
  thread: ChatThread;
  currentUserId: EntityId;
  onSend: (body: string) => void | Promise<void>;
}) {
  const [messages, setMessages] = useState(thread.messages);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("message") || "").trim();
    if (!body) return;
    await onSend(body);
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      threadId: thread.id,
      senderId: currentUserId,
      body,
      sentAt: new Date().toISOString(),
      readBy: [currentUserId],
    };
    setMessages((current) => [...current, message]);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5" aria-hidden />
          Booking conversation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3" aria-live="polite">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`rounded-lg p-3 ${message.senderId === currentUserId ? "bg-primary/10 ml-6" : "bg-muted mr-6"}`}
            >
              <p>{message.body}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {formatDateTime(message.sentAt)}
              </p>
            </li>
          ))}
        </ol>
        <form className="mt-4 flex gap-2" onSubmit={submit}>
          <label className="sr-only" htmlFor={`chat-${thread.id}`}>
            Message
          </label>
          <Input
            id={`chat-${thread.id}`}
            name="message"
            required
            placeholder="Write a contextual message"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function BookingSummaryCard({
  booking,
  event,
  performer,
  href,
}: {
  booking: Booking;
  event?: MarketplaceEvent;
  performer?: PerformerProfile;
  href: Route;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>{event?.title ?? booking.id}</CardTitle>
          <Badge variant="secondary">{titleCase(booking.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-2">
        <p>{performer?.displayName ?? booking.performerId}</p>
        <p>
          {event
            ? formatDateTime(event.startsAt)
            : `Requested ${formatDateTime(booking.requestedAt)}`}
        </p>
        <p className="text-foreground font-medium">{formatMoney(booking.agreedPrice)}</p>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={href}>View booking</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function BookingLifecycle({
  initialBooking,
  event,
  performer,
  payment,
  thread,
  calendarEntries,
  onStatusChange,
}: {
  initialBooking: Booking;
  event: MarketplaceEvent;
  performer: PerformerProfile;
  payment?: PaymentPlaceholder;
  thread?: ChatThread;
  calendarEntries?: readonly CalendarEntry[];
  onStatusChange?: (booking: Booking, status: BookingStatus) => void | Promise<void>;
}) {
  const [booking, setBooking] = useState(initialBooking);

  async function move(status: BookingStatus) {
    if (!canTransitionBooking(booking.status, status)) return;
    if (onStatusChange) await onStatusChange(booking, status);
    setBooking((current) => transitionBooking(current, status, new Date().toISOString()));
  }

  return (
    <div className="space-y-8">
      <BookingConfirmation
        title={`${performer.displayName} · ${event.title}`}
        reference={booking.id}
      />
      <BookingStatusTimeline status={booking.status} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <PricingBreakdown
          packageOption={performer.pricingPackages.find(
            (item) => item.id === booking.packageId,
          )}
          agreedPrice={booking.agreedPrice}
        />
        <AvailabilityContext
          availability={performer.availability}
          entries={calendarEntries}
        />
      </div>
      {payment ? (
        <AdvancePaymentDemo
          payment={payment}
          enabled={booking.status === "advance-pending"}
          onMarkPaid={() => move("advance-paid")}
        />
      ) : null}
      <CompletionReviewSubmission
        booking={booking}
        onComplete={() => move("completed")}
        onReviewSubmit={async () => {
          await move("reviewed");
        }}
      />
      {thread ? (
        <ContextualChatThread
          thread={thread}
          currentUserId={booking.hostId}
          onSend={() => undefined}
        />
      ) : null}
      {bookingTransitions[booking.status].length === 0 ? null : (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock3 className="size-4" aria-hidden />
          Available transitions are controlled by the marketplace state machine.
        </p>
      )}
    </div>
  );
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "font-semibold" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

const controlClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3.5 py-2 text-base outline-none focus-visible:ring-3 md:text-sm";
