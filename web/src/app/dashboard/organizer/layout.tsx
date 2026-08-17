import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  DashboardShell,
  type DashboardNavigationItem,
} from "@/components/layout/dashboard-shell";
import {
  EventStoreProvider,
  mockOrganizerPersona,
  resolveOrganizerDashboardData,
  mockMarketplaceRepositories,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const navigation: readonly DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard/organizer" as Route,
    icon: "overview",
    exact: true,
  },
  {
    label: "Venue Profile",
    href: "/dashboard/organizer/venue" as Route,
    icon: "settings",
  },
  { label: "My Events", href: "/dashboard/organizer/events" as Route, icon: "events" },
  {
    label: "Applications",
    href: "/dashboard/organizer/applications" as Route,
    icon: "applications",
  },
  {
    label: "Shortlisted Artists",
    href: "/dashboard/organizer/shortlisted" as Route,
    icon: "people",
  },
  {
    label: "Confirmed Artists",
    href: "/dashboard/organizer/confirmed" as Route,
    icon: "people",
  },
  {
    label: "Booking History",
    href: "/dashboard/organizer/history" as Route,
    icon: "events",
  },
  {
    label: "Recommendations",
    href: "/dashboard/organizer/recommendations" as Route,
    icon: "people",
  },
  {
    label: "Analytics",
    href: "/dashboard/organizer/analytics" as Route,
    icon: "analytics",
  },
];

export default async function OrganizerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const data = await resolveOrganizerDashboardData(
    mockMarketplaceRepositories,
    mockOrganizerPersona,
  );
  if (!data) notFound();

  return (
    <DashboardShell
      navigation={navigation}
      personaName={data.venue.name}
      personaKind="Organizer"
    >
      <EventStoreProvider
        initialEvents={data.events}
        hostId={data.persona.hostId}
        venue={data.venue}
      >
        {children}
      </EventStoreProvider>
    </DashboardShell>
  );
}
