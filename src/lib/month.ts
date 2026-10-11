import { addDays, parseDateUTC, startOfWeekMonday, weekDates } from "./format";
import type { Trip } from "./types";

const MONTH_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** First calendar day of the month containing `iso` (YYYY-MM-DD). */
export function startOfMonth(iso: string): string {
  const d = parseDateUTC(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

/** Last calendar day of the month containing `iso`. */
export function endOfMonth(iso: string): string {
  const d = parseDateUTC(iso);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return last.toISOString().slice(0, 10);
}

/** Shift by whole calendar months; always lands on the 1st. */
export function addMonths(iso: string, months: number): string {
  const d = parseDateUTC(startOfMonth(iso));
  d.setUTCMonth(d.getUTCMonth() + months, 1);
  return d.toISOString().slice(0, 10);
}

export function formatMonthLabel(iso: string): string {
  return MONTH_FMT.format(parseDateUTC(startOfMonth(iso)));
}

/**
 * Monday week-start dates (YYYY-MM-DD) whose Mon–Fri school days
 * overlap the calendar month of `monthIso`.
 */
export function weeksOverlappingMonth(monthIso: string): string[] {
  const monthStart = startOfMonth(monthIso);
  const monthEnd = endOfMonth(monthIso);
  let weekStart = startOfWeekMonday(monthStart);
  const weeks: string[] = [];

  while (weekStart <= monthEnd) {
    const schoolDays = weekDates(weekStart);
    if (schoolDays.some((d) => d >= monthStart && d <= monthEnd)) {
      weeks.push(weekStart);
    }
    weekStart = addDays(weekStart, 7);
  }

  return weeks;
}

export type MonthWeekDay = {
  date: string;
  inMonth: boolean;
  am: Trip | null;
  pm: Trip | null;
};

export type MonthWeekRow = {
  weekStart: string;
  days: MonthWeekDay[];
};

/** Build week rows for a month with AM/PM trips indexed per school day. */
export function buildMonthWeekRows(
  monthIso: string,
  trips: Trip[],
): MonthWeekRow[] {
  const monthStart = startOfMonth(monthIso);
  const monthEnd = endOfMonth(monthIso);
  const byKey = new Map<string, Trip>();

  for (const t of trips) {
    byKey.set(`${t.date}:${t.direction}`, t);
  }

  return weeksOverlappingMonth(monthIso).map((weekStart) => ({
    weekStart,
    days: weekDates(weekStart).map((date) => ({
      date,
      inMonth: date >= monthStart && date <= monthEnd,
      am: byKey.get(`${date}:AM`) ?? null,
      pm: byKey.get(`${date}:PM`) ?? null,
    })),
  }));
}
