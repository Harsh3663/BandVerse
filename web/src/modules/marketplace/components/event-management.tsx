"use client";

import { Archive, Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { EmptyState } from "@/components/shared/result-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { eventTypes } from "../config/event-types";
import { genres, languages } from "../config/taxonomy";
import {
  createTimelineItemId,
  defaultEventTimeline,
  duplicateEventInput,
  eventStatusBadgeVariant,
  eventTimelineKinds,
  eventToFormInput,
  timelineKindLabel,
} from "../event-helpers";
import { mockVenueProfiles } from "../mock-data";
import { useEventStore } from "../event-store";
import { formatDateTime, formatMoney, titleCase } from "../format";
import type {
  MarketplaceEvent,
  MarketplaceEventInput,
  MarketplaceEventTimelineItem,
  MarketplaceEventStatus,
} from "../types";
import { MarketplaceEventTimeline } from "./event-timeline";
import { OpportunityDetails } from "./opportunity";

const controlClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3.5 py-2 text-base outline-none focus-visible:ring-3 md:text-sm";

export function OrganizerEventsManager() {
  const { listByHost, hostId } = useEventStore();
  const events = listByHost(hostId);

  return events.length ? (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <OrganizerEventCard key={event.id} event={event} />
      ))}
    </div>
  ) : (
    <EmptyState
      title="No events yet"
      description="Create your first event to start receiving artist applications."
      action={
        <Button asChild>
          <Link href={"/dashboard/organizer/events/new" as Route}>Create event</Link>
        </Button>
      }
    />
  );
}

function OrganizerEventCard({ event }: { event: MarketplaceEvent }) {
  const router = useRouter();
  const { archive, remove } = useEventStore();
  const [confirmAction, setConfirmAction] = useState<"archive" | "delete" | null>(null);
  const eventType = eventTypes.find(({ id }) => id === event.eventTypeId);

  function handleDuplicate() {
    router.push(`/dashboard/organizer/events/new?duplicateFrom=${event.id}` as Route);
  }

  function handleArchive() {
    archive(event.id);
    setConfirmAction(null);
  }

  function handleDelete() {
    remove(event.id);
    setConfirmAction(null);
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {eventType ? <Badge>{eventType.label}</Badge> : null}
              <Badge variant={eventStatusBadgeVariant(event.status)}>
                {titleCase(event.status)}
              </Badge>
            </div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Actions for ${event.title}`}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/organizer/events/${event.id}` as Route}>
                  <Pencil aria-hidden="true" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/organizer/events/${event.id}/edit` as Route}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy aria-hidden="true" />
                Duplicate
              </DropdownMenuItem>
              {event.status !== "archived" ? (
                <DropdownMenuItem onClick={() => setConfirmAction("archive")}>
                  <Archive aria-hidden="true" />
                  Archive
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmAction("delete")}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 space-y-2 text-sm">
        <p>{formatDateTime(event.startsAt)}</p>
        <p>
          {event.location.city}, {event.location.state}
        </p>
        {event.audienceSize ? <p>{event.audienceSize} guests</p> : null}
        <p className="text-foreground font-medium">
          {event.budget.minimum
            ? `${formatMoney(event.budget.minimum)} – ${formatMoney(event.budget.maximum)}`
            : `Up to ${formatMoney(event.budget.maximum)}`}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-3">
        {confirmAction ? (
          <ConfirmPanel
            title={
              confirmAction === "archive" ? "Archive this event?" : "Delete this event?"
            }
            description={
              confirmAction === "archive"
                ? "Archived events stay in your list but are hidden from performer discovery."
                : "This removes the event from your session. This action cannot be undone."
            }
            confirmLabel={confirmAction === "archive" ? "Archive event" : "Delete event"}
            destructive={confirmAction === "delete"}
            onConfirm={confirmAction === "archive" ? handleArchive : handleDelete}
            onCancel={() => setConfirmAction(null)}
          />
        ) : null}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/dashboard/organizer/events/${event.id}/edit` as Route}>
              Edit
            </Link>
          </Button>
          {event.status === "published" ? (
            <Button asChild className="flex-1">
              <Link href={`/opportunities/${event.id}` as Route}>Public view</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" className="flex-1">
              <Link href={`/dashboard/organizer/events/${event.id}` as Route}>
                Details
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export function OrganizerEventDetail({ eventId }: { eventId: string }) {
  const { getById } = useEventStore();
  const event = getById(eventId);
  const eventType = event
    ? eventTypes.find(({ id }) => id === event.eventTypeId)
    : undefined;

  if (!event || !eventType) {
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been deleted or is unavailable in the current session."
        action={
          <Button asChild variant="outline">
            <Link href={"/dashboard/organizer/events" as Route}>Back to events</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="outline">
          <Link href={"/dashboard/organizer/events" as Route}>Back to events</Link>
        </Button>
        <Button asChild>
          <Link href={`/dashboard/organizer/events/${event.id}/edit` as Route}>
            Edit event
          </Link>
        </Button>
      </div>
      <OpportunityDetails event={event} eventType={eventType} />
      {event.dressCode || event.theme || event.specialRequirements ? (
        <Card>
          <CardHeader>
            <CardTitle>Additional details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {event.dressCode ? (
              <Detail label="Dress code" value={event.dressCode} />
            ) : null}
            {event.theme ? <Detail label="Theme" value={event.theme} /> : null}
            {event.specialRequirements ? (
              <div className="sm:col-span-2">
                <Detail label="Special requirements" value={event.specialRequirements} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      <MarketplaceEventTimeline items={event.timeline} />
    </div>
  );
}

export function OrganizerEventForm({
  mode,
  eventId,
  duplicateFromId,
}: {
  mode: "create" | "edit";
  eventId?: string;
  duplicateFromId?: string;
}) {
  const router = useRouter();
  const { getById, create, update, venue } = useEventStore();
  const source =
    mode === "edit" && eventId
      ? getById(eventId)
      : duplicateFromId
        ? getById(duplicateFromId)
        : undefined;

  const initialValues = useMemo<MarketplaceEventInput>(() => {
    if (mode === "edit" && source) return eventToFormInput(source);
    if (duplicateFromId && source) return duplicateEventInput(source);
    return {
      title: "",
      eventTypeId: eventTypes[0]?.id ?? "concert",
      eventDate: "2026-11-15",
      startTime: "20:00",
      endTime: "23:00",
      venueId: venue.id,
      city: venue.location.city,
      budgetMaximum: 75_000,
      audienceSize: 250,
      languageIds: ["hindi", "english"],
      preferredGenreIds: ["fusion"],
      timeline: defaultEventTimeline(),
      status: "draft",
    };
  }, [duplicateFromId, mode, source, venue.id, venue.location.city]);

  const [values, setValues] = useState(initialValues);
  const [pending, setPending] = useState(false);

  function updateValue<K extends keyof MarketplaceEventInput>(
    key: K,
    value: MarketplaceEventInput[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    if (mode === "edit" && eventId) {
      update(eventId, values);
      router.push(`/dashboard/organizer/events/${eventId}` as Route);
    } else {
      const created = create(values);
      router.push(`/dashboard/organizer/events/${created.id}` as Route);
    }
    setPending(false);
  }

  if (mode === "edit" && eventId && !source) {
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been deleted or is unavailable in the current session."
        action={
          <Button asChild variant="outline">
            <Link href={"/dashboard/organizer/events" as Route}>Back to events</Link>
          </Button>
        }
      />
    );
  }

  return (
    <form className="space-y-8" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === "edit" ? "Edit event" : "Create event"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Title" htmlFor="event-title" className="md:col-span-2">
            <Input
              id="event-title"
              required
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
            />
          </Field>
          <Field label="Category" htmlFor="event-type">
            <select
              id="event-type"
              className={controlClass}
              value={values.eventTypeId}
              onChange={(event) => updateValue("eventTypeId", event.target.value)}
            >
              {eventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="event-status">
            <select
              id="event-status"
              className={controlClass}
              value={values.status}
              onChange={(event) =>
                updateValue("status", event.target.value as MarketplaceEventStatus)
              }
            >
              {(["draft", "published", "closed", "cancelled", "archived"] as const).map(
                (status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Date" htmlFor="event-date">
            <Input
              id="event-date"
              type="date"
              required
              value={values.eventDate}
              onChange={(event) => updateValue("eventDate", event.target.value)}
            />
          </Field>
          <Field label="Guest count" htmlFor="event-guests">
            <Input
              id="event-guests"
              type="number"
              min={1}
              value={values.audienceSize ?? ""}
              onChange={(event) =>
                updateValue("audienceSize", Number(event.target.value) || undefined)
              }
            />
          </Field>
          <Field label="Start time" htmlFor="event-start">
            <Input
              id="event-start"
              type="time"
              required
              value={values.startTime}
              onChange={(event) => updateValue("startTime", event.target.value)}
            />
          </Field>
          <Field label="End time" htmlFor="event-end">
            <Input
              id="event-end"
              type="time"
              required
              value={values.endTime}
              onChange={(event) => updateValue("endTime", event.target.value)}
            />
          </Field>
          <Field label="Venue" htmlFor="event-venue">
            <VenueSelect
              id="event-venue"
              value={values.venueId ?? ""}
              onChange={(venueId, city) => {
                updateValue("venueId", venueId || undefined);
                updateValue("city", city);
              }}
            />
          </Field>
          <Field label="City" htmlFor="event-city">
            <Input
              id="event-city"
              required
              value={values.city}
              onChange={(event) => updateValue("city", event.target.value)}
            />
          </Field>
          <Field label="Budget minimum (INR)" htmlFor="event-budget-min">
            <Input
              id="event-budget-min"
              type="number"
              min={0}
              value={values.budgetMinimum ?? ""}
              onChange={(event) =>
                updateValue("budgetMinimum", Number(event.target.value) || undefined)
              }
            />
          </Field>
          <Field label="Budget maximum (INR)" htmlFor="event-budget-max">
            <Input
              id="event-budget-max"
              type="number"
              min={1}
              required
              value={values.budgetMaximum}
              onChange={(event) =>
                updateValue("budgetMaximum", Number(event.target.value))
              }
            />
          </Field>
          <Field label="Dress code" htmlFor="event-dress-code">
            <Input
              id="event-dress-code"
              value={values.dressCode ?? ""}
              onChange={(event) => updateValue("dressCode", event.target.value)}
            />
          </Field>
          <Field label="Theme" htmlFor="event-theme">
            <Input
              id="event-theme"
              value={values.theme ?? ""}
              onChange={(event) => updateValue("theme", event.target.value)}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="event-description"
            className="md:col-span-2"
          >
            <textarea
              id="event-description"
              rows={4}
              className={controlClass}
              value={values.description ?? ""}
              onChange={(event) => updateValue("description", event.target.value)}
            />
          </Field>
          <Field
            label="Special requirements"
            htmlFor="event-requirements"
            className="md:col-span-2"
          >
            <textarea
              id="event-requirements"
              rows={4}
              className={controlClass}
              value={values.specialRequirements ?? ""}
              onChange={(event) => updateValue("specialRequirements", event.target.value)}
            />
          </Field>
          <Field label="Languages" htmlFor="event-languages" className="md:col-span-2">
            <MultiSelect
              id="event-languages"
              options={languages}
              values={values.languageIds}
              onChange={(languageIds) => updateValue("languageIds", languageIds)}
            />
          </Field>
          <Field
            label="Music preferences"
            htmlFor="event-genres"
            className="md:col-span-2"
          >
            <MultiSelect
              id="event-genres"
              options={genres}
              values={values.preferredGenreIds}
              onChange={(preferredGenreIds) =>
                updateValue("preferredGenreIds", preferredGenreIds)
              }
            />
          </Field>
        </CardContent>
      </Card>

      <EventTimelineEditor
        items={values.timeline}
        onChange={(timeline) => updateValue("timeline", timeline)}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create event"}
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href={"/dashboard/organizer/events" as Route}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

function EventTimelineEditor({
  items,
  onChange,
}: {
  items: readonly MarketplaceEventTimelineItem[];
  onChange: (items: readonly MarketplaceEventTimelineItem[]) => void;
}) {
  function updateItem(id: string, patch: Partial<MarketplaceEventTimelineItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: createTimelineItemId(),
        label: "Custom item",
        kind: "custom",
        startTime: "19:00",
        status: "pending",
      },
    ]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Event timeline</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus aria-hidden="true" />
          Add item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="border-border grid gap-3 rounded-lg border p-4 md:grid-cols-2"
            >
              <Field label="Label" htmlFor={`${item.id}-label`}>
                <Input
                  id={`${item.id}-label`}
                  value={item.label}
                  onChange={(event) => updateItem(item.id, { label: event.target.value })}
                />
              </Field>
              <Field label="Kind" htmlFor={`${item.id}-kind`}>
                <select
                  id={`${item.id}-kind`}
                  className={controlClass}
                  value={item.kind}
                  onChange={(event) =>
                    updateItem(item.id, {
                      kind: event.target.value as MarketplaceEventTimelineItem["kind"],
                      label: timelineKindLabel(
                        event.target.value as MarketplaceEventTimelineItem["kind"],
                      ),
                    })
                  }
                >
                  {eventTimelineKinds.map((kind) => (
                    <option key={kind.id} value={kind.id}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start time" htmlFor={`${item.id}-start`}>
                <Input
                  id={`${item.id}-start`}
                  type="time"
                  value={item.startTime}
                  onChange={(event) =>
                    updateItem(item.id, { startTime: event.target.value })
                  }
                />
              </Field>
              <Field label="End time" htmlFor={`${item.id}-end`}>
                <Input
                  id={`${item.id}-end`}
                  type="time"
                  value={item.endTime ?? ""}
                  onChange={(event) =>
                    updateItem(item.id, { endTime: event.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Status" htmlFor={`${item.id}-status`}>
                <select
                  id={`${item.id}-status`}
                  className={controlClass}
                  value={item.status}
                  onChange={(event) =>
                    updateItem(item.id, {
                      status: event.target
                        .value as MarketplaceEventTimelineItem["status"],
                    })
                  }
                >
                  {(["pending", "active", "completed", "delayed"] as const).map(
                    (status) => (
                      <option key={status} value={status}>
                        {titleCase(status)}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Notes" htmlFor={`${item.id}-notes`}>
                <Input
                  id={`${item.id}-notes`}
                  value={item.notes ?? ""}
                  onChange={(event) =>
                    updateItem(item.id, { notes: event.target.value || undefined })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  Remove item
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No timeline items"
            description="Add setup, sound check, and performance milestones for your event day."
            action={
              <Button type="button" variant="outline" onClick={addItem}>
                Add first item
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

function VenueSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (venueId: string, city: string) => void;
}) {
  return (
    <select
      id={id}
      className={controlClass}
      value={value}
      onChange={(event) => {
        const selected = mockVenueProfiles.find((item) => item.id === event.target.value);
        onChange(event.target.value, selected?.location.city ?? "");
      }}
    >
      <option value="">No venue selected</option>
      {mockVenueProfiles.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}

function MultiSelect({
  id,
  options,
  values,
  onChange,
}: {
  id: string;
  options: readonly { id: string; label: string }[];
  values: readonly string[];
  onChange: (values: readonly string[]) => void;
}) {
  return (
    <select
      id={id}
      multiple
      className={`${controlClass} min-h-28`}
      value={[...values]}
      onChange={(event) => {
        const selected = [...event.target.selectedOptions].map((option) => option.value);
        onChange(selected);
      }}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ConfirmPanel({
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      className="border-border bg-muted/40 w-full rounded-lg border p-4"
    >
      <p id="confirm-title" className="font-medium">
        {title}
      </p>
      <p id="confirm-description" className="text-muted-foreground mt-1 text-sm">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={destructive ? "destructive" : "default"}
          size="sm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
