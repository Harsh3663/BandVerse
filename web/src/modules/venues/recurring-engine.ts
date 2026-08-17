import type { RecurringGig, RecurringGigOccurrence } from "./types";

const weekdayIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function normalizeWeekday(value: string): number | undefined {
  const trimmed = value.trim().toLowerCase();
  if (/^[1-7]$/.test(trimmed)) {
    // 1=Monday … 7=Sunday → JS getUTCDay
    const n = Number(trimmed);
    return n === 7 ? 0 : n;
  }
  return weekdayIndex[trimmed];
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Expand active recurring gigs into concrete occurrences within a date window.
 */
export function expandRecurringGigs(
  gigs: readonly RecurringGig[],
  options: {
    fromDate: string;
    toDate: string;
    venueId?: string;
  },
): RecurringGigOccurrence[] {
  const from = new Date(`${options.fromDate}T00:00:00.000Z`);
  const to = new Date(`${options.toDate}T00:00:00.000Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return [];
  }

  const occurrences: RecurringGigOccurrence[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    const day = cursor.getUTCDay();
    const dateKey = toDateKey(cursor);

    for (const gig of gigs) {
      if (!gig.active) continue;
      if (options.venueId && gig.venueId !== options.venueId) continue;
      if (gig.activeFrom && dateKey < gig.activeFrom) continue;
      if (gig.activeUntil && dateKey > gig.activeUntil) continue;

      const wanted = gig.weekdays
        .map(normalizeWeekday)
        .filter((v): v is number => v !== undefined);
      if (!wanted.includes(day)) continue;

      occurrences.push({
        gigId: gig.id,
        venueId: gig.venueId,
        date: dateKey,
        startTime: gig.startTime,
        endTime: gig.endTime,
        title: gig.title,
        neededRoles: gig.neededRoles,
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return occurrences;
}

export function describeWeeklyGig(gig: RecurringGig): string {
  const days = gig.weekdays.join(", ");
  return `${gig.title}: Every ${days} ${gig.startTime}–${gig.endTime}`;
}
