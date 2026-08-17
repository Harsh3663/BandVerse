import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  mockMarketplaceRepositories,
  mockOrganizerPersona,
  OrganizerEventsManager,
  OrganizerPageHeader,
  resolveOrganizerDashboardData,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "My Events",
  description: "Create, edit, and manage events for your venue.",
  robots: { index: false, follow: false },
};

export default async function OrganizerEventsPage() {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="My Events"
        description="Create, edit, duplicate, archive, and delete events for your venue programme."
        action={
          <Button asChild>
            <Link href={"/dashboard/organizer/events/new" as Route}>Create event</Link>
          </Button>
        }
      />
      <OrganizerEventsManager />
    </div>
  );
}
