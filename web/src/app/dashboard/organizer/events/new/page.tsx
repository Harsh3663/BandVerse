import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import { OrganizerEventForm, OrganizerPageHeader } from "@/modules/marketplace";

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new organizer event.",
  robots: { index: false, follow: false },
};

interface OrganizerCreateEventPageProps {
  searchParams: Promise<{ duplicateFrom?: string }>;
}

export default async function OrganizerCreateEventPage({
  searchParams,
}: OrganizerCreateEventPageProps) {
  const { duplicateFrom } = await searchParams;

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title={duplicateFrom ? "Duplicate event" : "Create event"}
        description="Define the schedule, preferences, and timeline artists need before applying."
        action={
          <Button asChild variant="outline">
            <Link href={"/dashboard/organizer/events" as Route}>Back to events</Link>
          </Button>
        }
      />
      <OrganizerEventForm mode="create" duplicateFromId={duplicateFrom} />
    </div>
  );
}
