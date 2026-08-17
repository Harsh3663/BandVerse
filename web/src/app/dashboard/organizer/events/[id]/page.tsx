import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerEventDetail,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

interface OrganizerEventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrganizerEventDetailPageProps): Promise<Metadata> {
  const event = await mockMarketplaceRepositories.events.getById((await params).id);
  return event
    ? { title: event.title, description: "Organizer event details." }
    : { title: "Event not found" };
}

export default async function OrganizerEventDetailPage({
  params,
}: OrganizerEventDetailPageProps) {
  const { id } = await params;
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Event details"
        description="Review the full event brief, requirements, and day-of timeline."
      />
      <OrganizerEventDetail eventId={id} />
    </div>
  );
}
