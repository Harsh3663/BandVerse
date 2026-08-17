import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  ListChecks,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDuration, formatMoney } from "../format";
import type { OrganizerAnalytics, PerformerAnalytics } from "../types";

function AnalyticsMetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <Card size="sm" className="h-full">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="font-display mt-1 text-3xl font-semibold">{value}</p>
          {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
        </div>
        <span className="bg-primary/10 text-primary shrink-0 rounded-full p-3 [&>svg]:size-5">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}

export function OrganizerAnalyticsPanel({
  analytics,
}: {
  analytics: OrganizerAnalytics;
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary font-medium">Organizer analytics</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-balance">
          Programme performance
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Track upcoming events, artist pipeline health, committed spend, and timeline
          readiness across your venue programme.
        </p>
      </header>

      <section
        aria-label="Organizer analytics metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <AnalyticsMetricCard
          label="Upcoming events"
          value={analytics.upcomingEvents}
          hint="Published events on your calendar"
          icon={<CalendarDays aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Budget used"
          value={formatMoney(analytics.budgetUsed)}
          hint={`${analytics.budgetUsedPercent}% of ${formatMoney(analytics.budgetAllocated)} allocated`}
          icon={<IndianRupee aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Pending artists"
          value={analytics.pendingArtists}
          hint="Submitted and shortlisted proposals"
          icon={<Users aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Confirmed artists"
          value={analytics.confirmedArtists}
          hint="Accepted applications and active bookings"
          icon={<CheckCircle2 aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Timeline progress"
          value={`${analytics.timelineProgressPercent}%`}
          hint="Average readiness across scheduled run-of-show items"
          icon={<ListChecks aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Pipeline health"
          value={
            analytics.pendingArtists + analytics.confirmedArtists > 0 ? (
              <span className="inline-flex items-center gap-2">
                {Math.round(
                  (analytics.confirmedArtists /
                    (analytics.pendingArtists + analytics.confirmedArtists)) *
                    100,
                )}
                %<Badge variant="secondary">Conversion</Badge>
              </span>
            ) : (
              "—"
            )
          }
          hint="Confirmed artists vs total active pipeline"
          icon={<TrendingUp aria-hidden="true" />}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-primary size-5" aria-hidden="true" />
            Budget snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted h-3 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width]"
              style={{ width: `${analytics.budgetUsedPercent}%` }}
              role="progressbar"
              aria-valuenow={analytics.budgetUsedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Budget used"
            />
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-xs">Committed spend</dt>
              <dd className="mt-1 font-medium">{formatMoney(analytics.budgetUsed)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Upcoming allocation</dt>
              <dd className="mt-1 font-medium">
                {formatMoney(analytics.budgetAllocated)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Remaining headroom</dt>
              <dd className="mt-1 font-medium">
                {formatMoney({
                  amount: Math.max(
                    0,
                    analytics.budgetAllocated.amount - analytics.budgetUsed.amount,
                  ),
                  currency: "INR",
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export function PerformerAnalyticsPanel({
  analytics,
}: {
  analytics: PerformerAnalytics;
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-primary font-medium">Performer analytics</p>
        <h1 className="font-display mt-2 text-4xl font-semibold text-balance">
          Booking and profile insights
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Monitor bookings, earned revenue, profile interest, and how reliably you convert
          accepted opportunities into completed events.
        </p>
      </header>

      <section
        aria-label="Performer analytics metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <AnalyticsMetricCard
          label="Bookings"
          value={analytics.bookings}
          hint="Active and completed bookings"
          icon={<CalendarDays aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Revenue"
          value={formatMoney(analytics.revenue)}
          hint="From completed bookings"
          icon={<IndianRupee aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Rating"
          value={
            <span className="inline-flex items-center gap-2">
              {analytics.rating.toFixed(1)}
              <Star className="size-5 fill-current" aria-hidden="true" />
            </span>
          }
          hint={`${analytics.ratingCount} reviews`}
          icon={<Star aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Profile views"
          value={analytics.profileViews.toLocaleString("en-IN")}
          hint="Last 30 days (illustrative)"
          icon={<Eye aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Response time"
          value={formatDuration(analytics.responseTimeMinutes)}
          hint="Typical enquiry response window"
          icon={<Clock3 aria-hidden="true" />}
        />
        <AnalyticsMetricCard
          label="Completion rate"
          value={`${analytics.completionRatePercent}%`}
          hint="Completed events vs decided applications"
          icon={<CheckCircle2 aria-hidden="true" />}
        />
      </section>
    </div>
  );
}

export function AnalyticsSummaryLink({ href, label }: { href: Route; label?: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>{label ?? "View analytics"}</Link>
    </Button>
  );
}
