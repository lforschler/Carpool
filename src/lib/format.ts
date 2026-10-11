import type { Driver, Kid, Trip, TripStatus } from "./types";

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const WEEKDAY_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

export function parseDateUTC(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDay(iso: string): string {
  return DAY_FMT.format(parseDateUTC(iso));
}

export function formatWeekday(iso: string): string {
  return WEEKDAY_FMT.format(parseDateUTC(iso));
}

export function startOfWeekMonday(iso: string): string {
  const d = parseDateUTC(iso);
  const day = d.getUTCDay(); // 0 Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = parseDateUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekDates(mondayIso: string): string[] {
  return Array.from({ length: 5 }, (_, i) => addDays(mondayIso, i));
}

export function driverName(
  drivers: Driver[],
  driverId: string | null,
): string {
  if (!driverId) return "Unassigned";
  return drivers.find((d) => d.id === driverId)?.name ?? "Unknown";
}

export function kidName(kids: Kid[], kidId: string): string {
  return kids.find((k) => k.id === kidId)?.name ?? kidId;
}

export function statusLabel(status: TripStatus): string {
  switch (status) {
    case "planned":
      return "Planned";
    case "confirmed":
      return "Confirmed";
    case "unassigned":
      return "Needs driver";
    case "cancelled":
      return "No school / cancelled";
  }
}

export function tripHeadline(trip: Trip, drivers: Driver[]): string {
  if (trip.noSchool) return "No school";
  return `${trip.direction} · ${driverName(drivers, trip.driverId)}`;
}

export function exclusionNote(trip: Trip, kids: Kid[]): string | null {
  if (!trip.excludedIds.length) return null;
  const names = trip.excludedIds.map((id) => kidName(kids, id)).join(", ");
  return `Out: ${names}`;
}
