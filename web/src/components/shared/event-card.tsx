import { CalendarDays, MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { DiscoveryEvent } from "@/data/discovery-types";
import { formatCurrency, formatEventDate } from "@/lib/discovery";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: DiscoveryEvent;
  className?: string;
  priority?: boolean;
}

export function EventCard({ event, className, priority = false }: EventCardProps) {
  return (
    <Card
      className={cn(
        "group/card h-full gap-0 py-0 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        href={event.href as Route}
        className="focus-visible:ring-ring block outline-none focus-visible:ring-3"
        aria-label={`View ${event.title}`}
      >
        <div className="bg-muted relative aspect-[16/9] overflow-hidden">
          <Image
            src={event.image}
            alt={event.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover/card:scale-[1.02] motion-reduce:transition-none"
          />
          <Badge className="absolute top-3 left-3" variant="secondary">
            {event.category}
          </Badge>
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 py-4">
        <h2 className="font-heading text-lg leading-snug font-semibold">
          <Link
            className="hover:text-primary focus-visible:underline"
            href={event.href as Route}
          >
            {event.title}
          </Link>
        </h2>
        <dl className="text-muted-foreground space-y-2 text-sm">
          <div className="flex gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Date</dt>
            <dd>{formatEventDate(event.date)}</dd>
          </div>
          <div className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Venue</dt>
            <dd>
              {event.venue}, {event.city}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-muted-foreground text-sm">
          {event.priceFrom === undefined ? "Free entry" : "Tickets from"}
        </span>
        {event.priceFrom !== undefined ? (
          <span className="font-semibold">{formatCurrency(event.priceFrom)}</span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
