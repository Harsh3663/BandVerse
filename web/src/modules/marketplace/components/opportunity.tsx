import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatDateTime, formatMoney, titleCase } from "../format";
import type {
  EventFieldDefinition,
  EventTypeDefinition,
  MarketplaceEvent,
} from "../types";
import { MarketplaceEventTimeline } from "./event-timeline";

interface OpportunityProps {
  event: MarketplaceEvent;
  eventType: EventTypeDefinition;
}

export function OpportunityCard({
  event,
  eventType,
  href,
}: OpportunityProps & { href: Route }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge>{eventType.label}</Badge>
          <Badge variant="outline">{titleCase(event.status)}</Badge>
        </div>
        <CardTitle className="mt-2 text-lg">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 space-y-3">
        <Fact icon={<CalendarDays />} text={formatDateTime(event.startsAt)} />
        <Fact
          icon={<MapPin />}
          text={`${event.location.city}, ${event.location.state}`}
        />
        {event.audienceSize ? (
          <Fact icon={<Users />} text={`${event.audienceSize} guests`} />
        ) : null}
        <p className="text-foreground font-medium">
          Up to {formatMoney(event.budget.maximum)}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={href}>Review opportunity</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function OpportunityDetails({ event, eventType }: OpportunityProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{eventType.label}</Badge>
          <Badge variant="outline">{titleCase(event.status)}</Badge>
        </div>
        <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
          {event.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg">
          {event.description ?? eventType.description}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Detail
          label="Schedule"
          value={`${formatDateTime(event.startsAt)} – ${formatDateTime(event.endsAt)}`}
        />
        <Detail
          label="Location"
          value={`${event.location.city}, ${event.location.state}`}
        />
        <Detail
          label="Budget"
          value={`${event.budget.minimum ? `${formatMoney(event.budget.minimum)} – ` : "Up to "}${formatMoney(event.budget.maximum)}`}
        />
        <Detail
          label="Preferences"
          value={
            [...event.preferredGenreIds, ...event.preferredInstrumentIds]
              .map(titleCase)
              .join(", ") || "Open to proposals"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {eventType.fields.map((field) => (
              <div key={field.id}>
                <dt className="text-muted-foreground text-xs">{field.label}</dt>
                <dd className="mt-1 font-medium">
                  {formatFieldValue(field, event.customFieldValues[field.id])}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {event.timeline.length ? (
        <MarketplaceEventTimeline items={event.timeline} compact />
      ) : null}
    </div>
  );
}

function formatFieldValue(
  field: EventFieldDefinition,
  value: string | number | boolean | readonly string[] | undefined,
) {
  if (value === undefined) return field.required ? "To be confirmed" : "Not specified";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 font-medium">{value}</p>
      </CardContent>
    </Card>
  );
}

function Fact({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="flex gap-2">
      <span className="text-primary [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      {text}
    </p>
  );
}
