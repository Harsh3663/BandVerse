import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  DashboardShell,
  type DashboardNavigationItem,
} from "@/components/layout/dashboard-shell";
import {
  mockMarketplaceRepositories,
  mockPerformerPersonaId,
} from "@/modules/marketplace";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const navigation: readonly DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard/performer" as Route,
    icon: "overview",
    exact: true,
  },
  {
    label: "My Applications",
    href: "/dashboard/performer/applications" as Route,
    icon: "applications",
  },
  {
    label: "Analytics",
    href: "/dashboard/performer/analytics" as Route,
    icon: "analytics",
  },
];

export default async function PerformerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const performer =
    await mockMarketplaceRepositories.performers.getById(mockPerformerPersonaId);
  if (!performer) notFound();

  return (
    <DashboardShell
      navigation={navigation}
      personaName={performer.displayName}
      personaKind="Performer"
    >
      {children}
    </DashboardShell>
  );
}
