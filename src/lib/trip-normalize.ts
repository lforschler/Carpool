import type { Trip, TripStatus } from "./types";
import { toDbStatus } from "./schedule-api";

/** Normalize a trip after local edits (no-school, driver assign). */
export function normalizeTrip(trip: Trip): Trip {
  if (trip.noSchool) {
    return { ...trip, status: "cancelled", driverId: null, riderIds: [] };
  }
  if (!trip.driverId && trip.status !== "cancelled") {
    return { ...trip, status: "unassigned" };
  }
  if (trip.driverId && trip.status === "unassigned") {
    return { ...trip, status: "planned" };
  }
  return trip;
}

type TripDbStatus = "PLANNED" | "CONFIRMED" | "UNASSIGNED" | "CANCELLED";

/**
 * Resolve DB trip status for a PATCH that may change driver / noSchool / status.
 * Mirrors src/app/api/trips/[id]/route.ts.
 */
export function resolveTripPatchStatus(args: {
  existingStatus: TripDbStatus;
  status?: TripStatus;
  noSchool?: boolean;
  driverId?: string | null;
}): TripDbStatus {
  let status = args.existingStatus;
  if (args.status) status = toDbStatus(args.status);
  if (args.noSchool) status = "CANCELLED";
  else if (args.driverId === null) status = "UNASSIGNED";
  else if (args.driverId && status === "UNASSIGNED") status = "PLANNED";
  return status;
}
