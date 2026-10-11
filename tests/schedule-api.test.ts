import { describe, expect, it } from "vitest";
import {
  buildSchedulePayload,
  mapTrip,
  toDbStatus,
  toUiStatus,
} from "@/lib/schedule-api";

describe("status mapping", () => {
  it("maps DB → UI statuses", () => {
    expect(toUiStatus("PLANNED", false)).toBe("planned");
    expect(toUiStatus("CONFIRMED", false)).toBe("confirmed");
    expect(toUiStatus("UNASSIGNED", false)).toBe("unassigned");
    expect(toUiStatus("CANCELLED", false)).toBe("cancelled");
    expect(toUiStatus("PLANNED", true)).toBe("cancelled");
  });

  it("maps UI → DB statuses", () => {
    expect(toDbStatus("planned")).toBe("PLANNED");
    expect(toDbStatus("confirmed")).toBe("CONFIRMED");
    expect(toDbStatus("unassigned")).toBe("UNASSIGNED");
    expect(toDbStatus("cancelled")).toBe("CANCELLED");
  });
});

describe("mapTrip / buildSchedulePayload", () => {
  const child = {
    id: "kid-blake",
    familyId: "fam-1",
    name: "Blake",
    shortName: "Blake",
    school: null,
    grade: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const driver = {
    id: "drv-1",
    email: "lucas@carpool.local",
    passwordHash: "x",
    name: "Lucas Forschler",
    phone: null,
    canDrive: true,
    seatCapacity: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("maps a trip with Date date and riders", () => {
    const trip = mapTrip({
      id: "trip-1",
      groupId: "g1",
      date: new Date("2026-08-25T00:00:00.000Z"),
      direction: "AM",
      time: "7:30 AM",
      driverId: "drv-1",
      status: "PLANNED",
      noSchool: false,
      sheetNote: "Lucas",
      createdAt: new Date(),
      updatedAt: new Date(),
      driver,
      riders: [{ tripId: "trip-1", childId: "kid-blake", child }],
    });
    expect(trip).toMatchObject({
      id: "trip-1",
      date: "2026-08-25",
      direction: "AM",
      driverId: "drv-1",
      riderIds: ["kid-blake"],
      status: "planned",
      noSchool: false,
    });
  });

  it("builds schedule payload with sheet-aligned school year label", () => {
    const payload = buildSchedulePayload({
      families: [
        {
          id: "fam-1",
          name: "Forschler",
          homeAddress: "123 Main",
          phone: "555",
          memberships: [{ user: driver }],
          children: [child],
        },
      ],
      drivers: [driver],
      kids: [child],
      trips: [],
    });
    expect(payload.source).toBe("database");
    expect(payload.schoolYearLabel).toContain("2027");
    expect(payload.families[0]).toMatchObject({
      name: "Forschler",
      parentName: "Lucas Forschler",
      kidIds: ["kid-blake"],
      driverId: "drv-1",
    });
    expect(payload.kids[0]).toMatchObject({
      id: "kid-blake",
      short: "Blake",
    });
    expect(payload.drivers[0]).toMatchObject({
      name: "Lucas",
      fullName: "Lucas Forschler",
      seatCapacity: 5,
    });
  });
});
