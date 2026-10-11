import { describe, expect, it } from "vitest";
import { normalizeTrip, resolveTripPatchStatus } from "@/lib/trip-normalize";
import type { Trip } from "@/lib/types";

const base: Trip = {
  id: "trip-1",
  date: "2026-08-25",
  direction: "AM",
  time: "7:30 AM",
  driverId: "drv-lucas",
  riderIds: ["kid-blake", "kid-anderson"],
  excludedIds: [],
  status: "planned",
  noSchool: false,
  sheetNote: "Lucas",
};

describe("normalizeTrip", () => {
  it("clears riders/driver when no school", () => {
    expect(normalizeTrip({ ...base, noSchool: true })).toEqual({
      ...base,
      noSchool: true,
      status: "cancelled",
      driverId: null,
      riderIds: [],
    });
  });

  it("marks unassigned when driver cleared", () => {
    expect(normalizeTrip({ ...base, driverId: null })).toMatchObject({
      status: "unassigned",
      driverId: null,
    });
  });

  it("promotes unassigned → planned when a driver is assigned", () => {
    expect(
      normalizeTrip({
        ...base,
        driverId: "drv-dee",
        status: "unassigned",
      }),
    ).toMatchObject({ status: "planned", driverId: "drv-dee" });
  });
});

describe("resolveTripPatchStatus (driver assign)", () => {
  it("applies explicit status", () => {
    expect(
      resolveTripPatchStatus({
        existingStatus: "PLANNED",
        status: "confirmed",
      }),
    ).toBe("CONFIRMED");
  });

  it("cancels on noSchool", () => {
    expect(
      resolveTripPatchStatus({
        existingStatus: "PLANNED",
        noSchool: true,
      }),
    ).toBe("CANCELLED");
  });

  it("unassigns when driverId is null", () => {
    expect(
      resolveTripPatchStatus({
        existingStatus: "PLANNED",
        driverId: null,
      }),
    ).toBe("UNASSIGNED");
  });

  it("plans when assigning a driver to an unassigned trip", () => {
    expect(
      resolveTripPatchStatus({
        existingStatus: "UNASSIGNED",
        driverId: "drv-lucas",
      }),
    ).toBe("PLANNED");
  });
});
