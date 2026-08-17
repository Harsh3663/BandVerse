import { ArrowRight, CalendarDays, MapPin, Music2, Users } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { EventCard } from "@/components/shared/event-card";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/shared/page-hero";
import { PerformerCard } from "@/components/shared/performer-card";
import { EmptyState } from "@/components/shared/result-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import {
  discoveryCategories,
  discoveryEvents,
  discoveryPerformers,
  type DiscoveryCategory,
  type DiscoveryPerformer,
  type PerformerKind,
} from "@/data/discovery";
import { formatCurrency, formatEventDate } from "@/lib/discovery";

import { performerMatchesCategory } from "./search";

const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function DiscoverPage() {
  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Live talent for every kind of moment"
        description="Browse performers, musical traditions, and upcoming live events from across India."
        actions={
          <Button asChild>
            <Link href="/search">
              Search all performers
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <Container className="space-y-14 py-10 sm:py-14">
        <SectionHeading
          title="Explore categories"
          description="Start with a sound, style, or type of performance."
          href="/categories"
        />
        <CategoryGrid categories={discoveryCategories.slice(0, 4)} />
        <SectionHeading
          title="Featured performers"
          description="Highly rated artists and groups ready for the stage."
          href="/artists"
        />
        <PerformerGrid performers={discoveryPerformers.slice(0, 4)} />
        <SectionHeading
          title="Upcoming events"
          description="See live music and cultural performances near you."
          href="/events"
        />
        <EventGrid events={discoveryEvents} />
      </Container>
    </>
  );
}

export function CategoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Categories"
        title="Explore by performance style"
        description="From intimate solo sets to full-scale traditional ensembles, find the right sound for your event."
      />
      <Container className="py-10 sm:py-14">
        <CategoryGrid categories={discoveryCategories} />
      </Container>
    </>
  );
}

export function PerformerDirectoryPage({
  kind,
}: {
  kind: Extract<PerformerKind, "artist" | "band">;
}) {
  const isArtist = kind === "artist";
  const performers = discoveryPerformers.filter((performer) => performer.kind === kind);

  return (
    <>
      <PageHero
        eyebrow={isArtist ? "Artists" : "Bands"}
        title={isArtist ? "Discover independent artists" : "Find a band"}
        description={
          isArtist
            ? "Explore singers, instrumentalists, and DJs bringing distinctive sounds to every stage."
            : "Browse versatile bands for weddings, festivals, corporate events, and live venues."
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/search?kind=${kind}` as Route}>Refine your search</Link>
          </Button>
        }
      />
      <Container className="py-10 sm:py-14">
        <PerformerGrid performers={performers} />
      </Container>
    </>
  );
}

export function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Upcoming live performances"
        description="Plan your next night out with live music and cultural events from across India."
      />
      <Container className="py-10 sm:py-14">
        <EventGrid events={discoveryEvents} />
      </Container>
    </>
  );
}

export function getCategory(slug: string): DiscoveryCategory | undefined {
  const canonicalSlug = slug === "folk" ? "folk-artists" : slug;
  return discoveryCategories.find((category) => category.id === canonicalSlug);
}

export function CategoryPage({ slug }: { slug: string }) {
  const category = getCategory(slug);
  if (!category) notFound();

  const performers = discoveryPerformers.filter((performer) =>
    performerMatchesCategory(performer, category.id),
  );

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.description}
        actions={
          <Button asChild>
            <Link href={`/search?category=${category.id}` as Route}>
              Search {category.name}
            </Link>
          </Button>
        }
      />
      <Container className="space-y-6 py-10 sm:py-14">
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Users className="size-4" aria-hidden="true" />
          {category.performerCount.toLocaleString("en-IN")} performers in this category
        </p>
        {performers.length ? (
          <PerformerGrid performers={performers} />
        ) : (
          <EmptyState
            title={`More ${category.name} are joining soon`}
            description="Try the full search to discover closely related performers."
            clearHref="/search"
          />
        )}
      </Container>
    </>
  );
}

export function getEvent(slug: string) {
  return discoveryEvents.find((event) => event.href.split("/").at(-1) === slug);
}

export function EventPage({ slug }: { slug: string }) {
  const event = getEvent(slug);
  if (!event) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: event.date,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          url: `${siteConfig.url}${event.href}`,
          image: [new URL(event.image.src, siteConfig.url).toString()],
          location: {
            "@type": "Place",
            name: event.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.city,
              addressCountry: "IN",
            },
          },
          ...(event.priceFrom === undefined
            ? {}
            : {
                offers: {
                  "@type": "Offer",
                  price: event.priceFrom,
                  priceCurrency: "INR",
                  availability: "https://schema.org/InStock",
                  url: `${siteConfig.url}${event.href}`,
                },
              }),
        }}
      />
      <PageHero
        eyebrow={event.category}
        title={event.title}
        description={`${event.venue}, ${event.city}`}
      />
      <Container width="default" className="py-10 sm:py-14">
        <article className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={event.image}
              alt={event.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
          </div>
          <Card>
            <CardContent className="space-y-6">
              <dl className="space-y-5">
                <EventFact
                  icon={<CalendarDays aria-hidden="true" />}
                  label="Date and time"
                  value={formatEventDate(event.date)}
                />
                <EventFact
                  icon={<MapPin aria-hidden="true" />}
                  label="Venue"
                  value={`${event.venue}, ${event.city}`}
                />
                <EventFact
                  icon={<Music2 aria-hidden="true" />}
                  label="Admission"
                  value={
                    event.priceFrom === undefined
                      ? "Free entry"
                      : `From ${formatCurrency(event.priceFrom)}`
                  }
                />
              </dl>
              <Button asChild className="w-full">
                <Link
                  href={
                    `/contact?topic=general&intent=event&event=${encodeURIComponent(event.title)}` as Route
                  }
                >
                  Event enquiries
                </Link>
              </Button>
            </CardContent>
          </Card>
        </article>
      </Container>
    </>
  );
}

function SectionHeading({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: Route;
}) {
  return (
    <div className="-mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      <Button asChild variant="ghost">
        <Link href={href}>
          View all
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function CategoryGrid({ categories }: { categories: readonly DiscoveryCategory[] }) {
  return (
    <section aria-label="Performance categories" className={gridClass}>
      {categories.map((category, index) => (
        <Card key={category.id} className="group overflow-hidden py-0">
          <Link
            href={`/categories/${category.id}` as Route}
            className="focus-visible:ring-ring block h-full outline-none focus-visible:ring-3"
            aria-label={`Explore ${category.name}`}
          >
            <div className="bg-muted relative aspect-[4/3] overflow-hidden">
              <Image
                src={category.image}
                alt={category.imageAlt}
                fill
                priority={index < 4}
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            </div>
            <CardContent className="space-y-2">
              <h2 className="font-heading text-lg font-semibold">{category.name}</h2>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                {category.description}
              </p>
              <Badge variant="secondary">
                {category.performerCount.toLocaleString("en-IN")} performers
              </Badge>
            </CardContent>
          </Link>
        </Card>
      ))}
    </section>
  );
}

function PerformerGrid({ performers }: { performers: readonly DiscoveryPerformer[] }) {
  return (
    <section aria-label="Performers" className={gridClass}>
      {performers.map((performer, index) => (
        <PerformerCard key={performer.id} performer={performer} priority={index < 4} />
      ))}
    </section>
  );
}

function EventGrid({ events }: { events: typeof discoveryEvents }) {
  return (
    <section
      aria-label="Upcoming events"
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      {events.map((event, index) => (
        <EventCard key={event.id} event={event} priority={index < 3} />
      ))}
    </section>
  );
}

function EventFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-0.5 [&_svg]:size-5">{icon}</div>
      <div>
        <dt className="text-muted-foreground text-sm">{label}</dt>
        <dd className="mt-0.5 font-medium">{value}</dd>
      </div>
    </div>
  );
}
