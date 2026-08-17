import type { Metadata } from "next";

import { discoveryEvents } from "@/data/discovery";
import { EventPage, getEvent } from "@/features/search/discovery-pages";

interface EventRouteProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return discoveryEvents.map((event) => ({
    slug: event.href.split("/").at(-1)!,
  }));
}

export async function generateMetadata({ params }: EventRouteProps): Promise<Metadata> {
  const slug = (await params).slug;
  const event = getEvent(slug);
  return event
    ? {
        title: event.title,
        description: `${event.title} at ${event.venue}, ${event.city}.`,
        alternates: { canonical: `/events/${slug}` },
        openGraph: {
          type: "website",
          url: `/events/${slug}`,
          title: event.title,
          description: `${event.title} at ${event.venue}, ${event.city}.`,
          images: [{ url: event.image.src, alt: event.imageAlt }],
        },
      }
    : { title: "Event not found" };
}

export default async function EventRoute({ params }: EventRouteProps) {
  return <EventPage slug={(await params).slug} />;
}
