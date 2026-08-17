"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
  AvailabilityCalendar,
  AvailabilityStatus,
  CalendarEntry,
  ISODate,
  Weekday,
} from "../types";

const statuses: readonly AvailabilityStatus[] = [
  "available",
  "booked",
  "tentative",
  "blocked",
  "holiday",
  "travel",
];

const statusStyles: Record<AvailabilityStatus, string> = {
  available:
    "border-emerald-500/50 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
  booked: "border-rose-500/50 bg-rose-500/12 text-rose-800 dark:text-rose-200",
  tentative: "border-amber-500/50 bg-amber-500/12 text-amber-900 dark:text-amber-200",
  blocked: "border-zinc-500/50 bg-zinc-500/12 text-zinc-800 dark:text-zinc-200",
  holiday: "border-violet-500/50 bg-violet-500/12 text-violet-800 dark:text-violet-200",
  travel: "border-sky-500/50 bg-sky-500/12 text-sky-800 dark:text-sky-200",
};

const weekdayNames: readonly Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export interface MarketplaceAvailabilityCalendarProps {
  availability: AvailabilityCalendar;
  entries?: readonly CalendarEntry[];
  initialMonth?: ISODate;
  selectedDate?: ISODate;
  onDateSelect?: (date: ISODate) => void;
  selectable?: boolean;
  title?: string;
  className?: string;
}

export function MarketplaceAvailabilityCalendar({
  availability,
  entries = [],
  initialMonth,
  selectedDate,
  onDateSelect,
  selectable = false,
  title = "Availability calendar",
  className,
}: MarketplaceAvailabilityCalendarProps) {
  const initial = validDate(initialMonth ?? selectedDate)
    ? parseDate(initialMonth ?? selectedDate ?? "")
    : startOfCurrentMonth();
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: initial.getUTCFullYear(),
    month: initial.getUTCMonth(),
  }));

  const days = useMemo(
    () => monthCells(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );
  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 1)));
  const entryByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.startsAt.slice(0, 10), entry])),
    [entries],
  );

  function moveMonth(offset: number) {
    const next = new Date(Date.UTC(visibleMonth.year, visibleMonth.month + offset, 1));
    setVisibleMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => moveMonth(-1)}
              aria-label="Show previous month"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <p className="min-w-36 text-center font-medium" aria-live="polite">
              {monthLabel}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => moveMonth(1)}
              aria-label="Show next month"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
        <ul
          className="mt-3 flex flex-wrap gap-x-4 gap-y-2"
          aria-label="Availability status legend"
        >
          {statuses.map((status) => (
            <li key={status} className="flex items-center gap-2 text-xs">
              <span
                className={cn("size-3 rounded-sm border", statusStyles[status])}
                aria-hidden
              />
              <span className="capitalize">{status}</span>
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              role="columnheader"
              className="text-muted-foreground py-1 text-center text-xs font-medium"
            >
              {day}
            </div>
          ))}
          {days.map(({ date, inMonth }) => {
            const isoDate = formatISODate(date);
            const entry = entryByDate.get(isoDate);
            const status = resolveStatus(isoDate, date, availability, entry);
            const meetsLeadTime = isAfterMinimumLead(date, availability.minimumLeadDays);
            const canSelect = selectable && status === "available" && meetsLeadTime;
            const label = `${new Intl.DateTimeFormat("en-IN", {
              dateStyle: "full",
              timeZone: "UTC",
            }).format(date)}: ${status}${entry ? `, ${entry.title}` : ""}${
              status === "available" && !meetsLeadTime
                ? ", inside minimum notice period"
                : ""
            }`;
            return (
              <div key={isoDate} role="gridcell" className="min-w-0">
                <button
                  type="button"
                  disabled={!canSelect}
                  onClick={() => onDateSelect?.(isoDate)}
                  aria-label={label}
                  aria-pressed={canSelect ? selectedDate === isoDate : undefined}
                  className={cn(
                    "focus-visible:ring-ring/60 flex min-h-14 w-full flex-col rounded-md border p-1.5 text-left text-xs outline-none focus-visible:ring-2 sm:min-h-20",
                    statusStyles[status],
                    !inMonth && "opacity-35",
                    canSelect && "cursor-pointer hover:ring-2 hover:ring-current/30",
                    selectedDate === isoDate && "ring-primary ring-2",
                    !canSelect && "cursor-default",
                  )}
                >
                  <span className="font-semibold">{date.getUTCDate()}</span>
                  <span className="mt-auto hidden truncate capitalize sm:block">
                    {status}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          Weekly schedule in {availability.timezone} · Minimum{" "}
          {availability.minimumLeadDays} days&apos; notice
        </p>
      </CardContent>
    </Card>
  );
}

function resolveStatus(
  isoDate: ISODate,
  date: Date,
  availability: AvailabilityCalendar,
  entry?: CalendarEntry,
): AvailabilityStatus {
  if (entry) return entry.status;
  if (availability.blockedDates.includes(isoDate)) return "blocked";
  if (availability.availableDates?.includes(isoDate)) return "available";
  return availability.weekly.some(
    (item) => item.weekday === weekdayNames[date.getUTCDay()] && item.ranges.length > 0,
  )
    ? "available"
    : "tentative";
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month, index - firstWeekday + 1));
    return { date, inMonth: date.getUTCMonth() === month };
  });
}

function formatISODate(date: Date): ISODate {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function validDate(value?: string): value is ISODate {
  return Boolean(
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parseDate(value).valueOf()),
  );
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function isAfterMinimumLead(date: Date, minimumLeadDays: number) {
  const now = new Date();
  const earliest = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + minimumLeadDays),
  );
  return date >= earliest;
}
