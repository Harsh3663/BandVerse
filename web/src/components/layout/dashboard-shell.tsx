"use client";

import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Container } from "./container";

export interface DashboardNavigationItem {
  label: string;
  href: Route;
  icon: "overview" | "applications" | "events" | "people" | "settings" | "analytics";
  exact?: boolean;
}

const dashboardIcons = {
  overview: LayoutDashboard,
  applications: FileText,
  events: CalendarDays,
  people: Users,
  settings: Settings,
  analytics: BarChart3,
} as const;

interface DashboardShellProps {
  children: ReactNode;
  navigation: readonly DashboardNavigationItem[];
  personaName: string;
  personaKind: string;
}

export function DashboardShell({
  children,
  navigation,
  personaName,
  personaKind,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="bg-muted/30 min-h-full border-y">
      <Container
        width="wide"
        className="grid min-h-[calc(100dvh-8rem)] lg:grid-cols-[16rem_minmax(0,1fr)]"
      >
        <aside className="border-border min-w-0 border-b py-4 lg:border-r lg:border-b-0 lg:py-8 lg:pr-6">
          <div className="min-w-0 space-y-4 lg:block lg:space-y-0">
            <div className="min-w-0">
              <Badge variant="secondary">{personaKind}</Badge>
              <p className="mt-2 truncate font-semibold">{personaName}</p>
            </div>
            <nav className="max-w-full min-w-0" aria-label={`${personaKind} dashboard`}>
              <ul className="flex max-w-full gap-1 overflow-x-auto lg:mt-6 lg:block lg:space-y-1">
                {navigation.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = dashboardIcons[item.icon];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "focus-visible:ring-ring flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-3",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>
        <div className="min-w-0 py-8 lg:py-10 lg:pl-8">{children}</div>
      </Container>
    </div>
  );
}
