import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerEventForm,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

interface OrganizerEditEventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrganizerEditEventPageProps): Promise<Metadata> {
  const event = await mockMarketplaceRepositories.events.getById((await params).id);
  return event
    ? { title: `Edit ${event.title}`, description: "Update organizer event details." }
    : { title: "Event not found" };
}

export default async function OrganizerEditEventPage({
  params,
}: OrganizerEditEventPageProps) {
  const { id } = await params;
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Edit event"
        description="Update the schedule, preferences, and timeline for this event."
        action={
          <Button asChild variant="outline">
            <Link href={`/dashboard/organizer/events/${id}` as Route}>View details</Link>
          </Button>
        }
      />
      <OrganizerEventForm mode="edit" eventId={id} />
    </div>
  );
}
