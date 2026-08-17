import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { EventCard } from "@/components/shared/event-card";
import { Button } from "@/components/ui/button";
import { discoveryEvents } from "@/data/discovery";

export function UpcomingPerformancesSection() {
  return (
    <section
      aria-labelledby="upcoming-title"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container width="wide">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
              Upcoming live performances
            </p>
            <h2
              id="upcoming-title"
              className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              Meet the music out in the world.
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
              Discover public performances and make your next night out sound
              unforgettable.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit shrink-0">
            <Link href={"/events" as Route}>
              Explore events <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="-mx-5 flex snap-x [scrollbar-width:none] gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {discoveryEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              priority={index === 0}
              className="w-[82vw] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
