import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBackendContainer } from "@/backend/infrastructure/container";
import { eventTypeRegistry } from "@/modules/marketplace/config/event-types";

export const metadata: Metadata = {
  title: "Discover events",
  description: "Filter live events by city, budget, category, date, and performer type.",
  alternates: { canonical: "/events/discover" },
};

export const dynamic = "force-dynamic";

interface DiscoverEventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function DiscoverEventsPage({
  searchParams,
}: DiscoverEventsPageProps) {
  const query = await searchParams;
  const filters = {
    city: first(query.city) || undefined,
    budgetMin: first(query.budgetMin) ? Number(first(query.budgetMin)) : undefined,
    budgetMax: first(query.budgetMax) ? Number(first(query.budgetMax)) : undefined,
    category: first(query.category) || undefined,
    dateFrom: first(query.dateFrom) || undefined,
    dateTo: first(query.dateTo) || undefined,
    performerType: first(query.performerType) || undefined,
  };

  const ecosystem = getBackendContainer().venueEcosystem;
  const events = await ecosystem.discoverEvents(filters);
  const nearbyCity = filters.city ?? "Mumbai";
  const nearby = await ecosystem.nearbyOpportunities({ city: nearbyCity, limit: 8 });
  const categories = Object.values(eventTypeRegistry);

  return (
    <Container className="space-y-10 py-10 sm:py-14">
      <header className="space-y-3">
        <p className="text-primary font-medium">Event marketplace</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Discover events
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Filter by city, budget, category, date, and performer type. Existing
          `/events` listing remains unchanged.
        </p>
      </header>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" method="get">
        <input
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder="City"
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="budgetMin"
          defaultValue={filters.budgetMin ?? ""}
          placeholder="Min budget (INR)"
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="budgetMax"
          defaultValue={filters.budgetMax ?? ""}
          placeholder="Max budget (INR)"
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <input
          name="dateFrom"
          type="date"
          defaultValue={filters.dateFrom ?? ""}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="dateTo"
          type="date"
          defaultValue={filters.dateTo ?? ""}
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <input
          name="performerType"
          defaultValue={filters.performerType ?? ""}
          placeholder="Performer type keyword"
          className="border-border bg-background rounded-md border px-3 py-2 text-sm"
        />
        <Button type="submit">Apply filters</Button>
      </form>

      <section className="space-y-4" aria-labelledby="filtered-events">
        <h2 id="filtered-events" className="font-display text-2xl font-semibold">
          Results ({events.length})
        </h2>
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="border-border rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {event.location.city} · {event.startsAt.slice(0, 10)} ·{" "}
                    {event.eventTypeId}
                  </p>
                  <p className="text-sm">
                    Budget up to ₹{event.budget.maximum.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <Badge variant="outline">{event.status}</Badge>
              </div>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-muted-foreground text-sm">No events match these filters.</li>
          ) : null}
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="nearby-opportunities">
        <h2 id="nearby-opportunities" className="font-display text-2xl font-semibold">
          Nearby opportunities · {nearbyCity}
        </h2>
        <ul className="space-y-2">
          {nearby.map((item) => (
            <li key={item.id} className="border-border rounded-lg border p-3 text-sm">
              <p className="font-medium">
                {item.title}{" "}
                <Badge variant="secondary">{item.kind.replace("_", " ")}</Badge>
              </p>
              <p className="text-muted-foreground">
                {item.city}
                {item.date ? ` · ${item.date}` : ""} · score {item.score}
              </p>
              <p className="text-muted-foreground">{item.reasons.join(" · ")}</p>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline">
          <Link href="/events">Back to events listing</Link>
        </Button>
      </section>
    </Container>
  );
}
