import type { Child, Trip, TripRider, User } from "@prisma/client";
import type { ScheduleData, Trip as UiTrip, TripStatus } from "@/lib/types";

type TripWithRels = Trip & {
  driver: User | null;
  riders: (TripRider & { child: Child })[];
};

export function toUiStatus(status: Trip["status"], noSchool: boolean): TripStatus {
  if (noSchool) return "cancelled";
  switch (status) {
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "UNASSIGNED":
      return "unassigned";
    default:
      return "planned";
  }
}

export function toDbStatus(status: TripStatus) {
  switch (status) {
    case "confirmed":
      return "CONFIRMED" as const;
    case "cancelled":
      return "CANCELLED" as const;
    case "unassigned":
      return "UNASSIGNED" as const;
    default:
      return "PLANNED" as const;
  }
}

export function mapTrip(trip: TripWithRels): UiTrip {
  const date =
    trip.date instanceof Date
      ? trip.date.toISOString().slice(0, 10)
      : String(trip.date).slice(0, 10);
  const riderIds = trip.riders.map((r) => r.childId);
  return {
    id: trip.id,
    date,
    direction: trip.direction,
    time: trip.time,
    driverId: trip.driverId,
    riderIds,
    excludedIds: [],
    status: toUiStatus(trip.status, trip.noSchool),
    noSchool: trip.noSchool,
    sheetNote: trip.sheetNote ?? "",
  };
}

export function buildSchedulePayload(args: {
  families: {
    id: string;
    name: string;
    homeAddress: string;
    phone: string | null;
    memberships: { user: User }[];
    children: Child[];
  }[];
  drivers: User[];
  kids: Child[];
  trips: TripWithRels[];
}): ScheduleData {
  return {
    source: "database",
    schoolYearLabel:
      "Fall 2026 / school year 2026–2027 (Google Sheet tab '2027')",
    families: args.families.map((f) => ({
      id: f.id,
      name: f.name,
      parentName: f.memberships[0]?.user.name ?? f.name,
      phone: f.phone ?? "",
      address: f.homeAddress,
      driverId: f.memberships[0]?.user.id ?? "",
      kidIds: f.children.map((c) => c.id),
    })),
    kids: args.kids.map((k) => ({
      id: k.id,
      name: k.name,
      familyId: k.familyId,
      short: k.shortName ?? k.name,
    })),
    drivers: args.drivers.map((d) => ({
      id: d.id,
      name: d.name.split(" ")[0] ?? d.name,
      fullName: d.name,
      familyId: null,
      seatCapacity: d.seatCapacity,
    })),
    trips: args.trips.map(mapTrip),
  };
}
