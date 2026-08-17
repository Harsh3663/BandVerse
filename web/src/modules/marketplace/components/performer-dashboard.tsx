"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";

import { EmptyState } from "@/components/shared/result-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AnalyticsSummaryLink } from "./analytics-panel";
import { formatDate, formatMoney } from "../format";
import type {
  ApplicationStatus,
  PerformerAnalytics,
  PerformerApplicationContext,
  PerformerProfile,
} from "../types";

export type PerformerApplicationStatus =
  "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export type PerformerApplicationRecord = PerformerApplicationContext;

const filters: readonly {
  value: PerformerApplicationStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function toPerformerApplicationStatus(
  status: ApplicationStatus,
): PerformerApplicationStatus {
  if (status === "submitted" || status === "shortlisted") return "pending";
  if (status === "withdrawn") return "cancelled";
  return status;
}

export function PerformerApplications({
  records,
}: {
  records: readonly PerformerApplicationRecord[];
}) {
  const [activeFilter, setActiveFilter] = useState<PerformerApplicationStatus>("pending");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visible = records.filter(
    ({ application }) =>
      toPerformerApplicationStatus(application.status) === activeFilter,
  );

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? filters.length - 1
          : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + filters.length) %
            filters.length;
    const next = filters[nextIndex];
    setActiveFilter(next.value);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Filter applications by status"
        className="border-border flex gap-1 overflow-x-auto border-b"
      >
        {filters.map((filter, index) => {
          const count = records.filter(
            ({ application }) =>
              toPerformerApplicationStatus(application.status) === filter.value,
          ).length;
          const active = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`application-tab-${filter.value}`}
              aria-selected={active}
              aria-controls="performer-application-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveFilter(filter.value)}
              onKeyDown={(event) => moveFocus(event, index)}
              className={`focus-visible:ring-ring flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium outline-none focus-visible:ring-3 ${
                active
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? "bg-primary/15 text-primary" : "bg-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="performer-application-panel"
        role="tabpanel"
        aria-labelledby={`application-tab-${activeFilter}`}
        tabIndex={0}
        className="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-3"
      >
        {visible.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {visible.map((record) => (
              <PerformerApplicationCard key={record.application.id} record={record} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${activeFilter} applications`}
            description={emptyDescriptions[activeFilter]}
            action={
              activeFilter === "pending" ? (
                <Button asChild>
                  <Link href={"/opportunities" as Route}>Explore opportunities</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export function PerformerApplicationCard({
  record: { application, event, venue, booking },
}: {
  record: PerformerApplicationRecord;
}) {
  const status = toPerformerApplicationStatus(application.status);
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              {venue?.name ?? `${event.location.city} venue`}
            </p>
            <CardTitle className="mt-1 text-xl">{event.title}</CardTitle>
          </div>
          <ApplicationStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <DashboardFact
            icon={CalendarDays}
            label="Event date"
            value={formatDate(event.startsAt)}
          />
          <DashboardFact
            icon={MapPin}
            label="Venue"
            value={`${venue?.name ?? event.location.city}, ${event.location.city}`}
          />
          <DashboardFact
            icon={FileText}
            label="Your quote"
            value={formatMoney(application.quotedPrice)}
          />
          <DashboardFact
            icon={Clock3}
            label="Application status"
            value={statusLabel(status, application.status)}
          />
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={`/opportunities/${event.id}` as Route}>View opportunity</Link>
        </Button>
        {booking ? (
          <Button asChild>
            <Link href={`/bookings/${booking.id}` as Route}>View booking</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export function PerformerDashboardOverview({
  performer,
  records,
  analytics,
}: {
  performer: PerformerProfile;
  records: readonly PerformerApplicationRecord[];
  analytics: PerformerAnalytics;
}) {
  const pending = records.filter(
    ({ application }) => toPerformerApplicationStatus(application.status) === "pending",
  ).length;
  const accepted = records.filter(
    ({ application }) => toPerformerApplicationStatus(application.status) === "accepted",
  ).length;
  const completed = records.filter(
    ({ application }) => toPerformerApplicationStatus(application.status) === "completed",
  ).length;
  const recent = [...records]
    .sort((a, b) => b.application.updatedAt.localeCompare(a.application.updatedAt))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary font-medium">Performer dashboard</p>
          <h1 className="font-display mt-2 text-4xl font-semibold text-balance">
            Welcome back, {performer.displayName}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Track proposals and turn accepted opportunities into successful events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnalyticsSummaryLink href={"/dashboard/performer/analytics" as Route} />
          <Button asChild>
            <Link href={"/opportunities" as Route}>
              Find opportunities <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="performer-analytics-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="performer-analytics-heading"
              className="font-display text-2xl font-semibold"
            >
              Analytics snapshot
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {analytics.bookings} bookings · {formatMoney(analytics.revenue)} earned ·{" "}
              {analytics.profileViews.toLocaleString("en-IN")} profile views
            </p>
          </div>
          <AnalyticsSummaryLink href={"/dashboard/performer/analytics" as Route} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
          <AnalyticsSnapshotCard label="Bookings" value={String(analytics.bookings)} />
          <AnalyticsSnapshotCard label="Revenue" value={formatMoney(analytics.revenue)} />
          <AnalyticsSnapshotCard label="Rating" value={analytics.rating.toFixed(1)} />
          <AnalyticsSnapshotCard
            label="Profile views"
            value={analytics.profileViews.toLocaleString("en-IN")}
          />
          <AnalyticsSnapshotCard
            label="Response time"
            value={`${Math.round(analytics.responseTimeMinutes / 60)} hr`}
          />
          <AnalyticsSnapshotCard
            label="Completion rate"
            value={`${analytics.completionRatePercent}%`}
          />
        </div>
      </section>

      <section aria-labelledby="application-summary-heading">
        <h2 id="application-summary-heading" className="sr-only">
          Application summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Pending" count={pending} icon={Clock3} />
          <SummaryCard label="Accepted" count={accepted} icon={CheckCircle2} />
          <SummaryCard label="Completed" count={completed} icon={CalendarDays} />
        </div>
      </section>

      <section aria-labelledby="recent-applications-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="recent-applications-heading"
              className="font-display text-2xl font-semibold"
            >
              Recent applications
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Your latest proposal updates.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={"/dashboard/performer/applications" as Route}>View all</Link>
          </Button>
        </div>
        {recent.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {recent.map((record) => (
              <PerformerApplicationCard key={record.application.id} record={record} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Explore open opportunities and submit your first proposal."
          />
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: typeof Clock3;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="font-display mt-1 text-3xl font-semibold">{count}</p>
        </div>
        <span className="bg-primary/10 text-primary rounded-full p-3">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function AnalyticsSnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-display mt-1 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DashboardFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="text-foreground mt-0.5 font-medium">{value}</dd>
      </div>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: PerformerApplicationStatus }) {
  return (
    <Badge
      variant={
        status === "rejected"
          ? "destructive"
          : status === "pending" || status === "cancelled"
            ? "outline"
            : "secondary"
      }
    >
      {filters.find((filter) => filter.value === status)?.label}
    </Badge>
  );
}

function statusLabel(
  displayStatus: PerformerApplicationStatus,
  domainStatus: ApplicationStatus,
) {
  if (displayStatus === "pending" && domainStatus === "shortlisted")
    return "Pending · Shortlisted";
  if (displayStatus === "pending") return "Pending · Submitted";
  if (domainStatus === "withdrawn") return "Cancelled · Withdrawn";
  return filters.find((filter) => filter.value === displayStatus)?.label ?? displayStatus;
}

const emptyDescriptions: Record<PerformerApplicationStatus, string> = {
  pending: "Submitted and shortlisted proposals awaiting a decision appear here.",
  accepted: "Applications accepted by an organizer will appear here.",
  rejected: "Applications that were not selected will appear here.",
  completed: "Applications for successfully completed events will appear here.",
  cancelled: "Cancelled or withdrawn applications will appear here.",
};
