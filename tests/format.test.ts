import { describe, expect, it } from "vitest";
import {
  addDays,
  driverName,
  exclusionNote,
  formatDay,
  formatWeekday,
  kidName,
  parseDateUTC,
  startOfWeekMonday,
  statusLabel,
  tripHeadline,
  weekDates,
} from "@/lib/format";
import type { Driver, Kid, Trip } from "@/lib/types";

const drivers: Driver[] = [
  {
    id: "drv-lucas",
    name: "Lucas",
    fullName: "Lucas Forschler",
    familyId: "fam-lucas",
    seatCapacity: 5,
  },
];

const kids: Kid[] = [
  {
    id: "kid-anderson",
    name: "Anderson",
    familyId: "fam-dee",
    short: "Andy",
  },
  { id: "kid-blake", name: "Blake", familyId: "fam-lucas", short: "Blake" },
];

describe("date / week helpers", () => {
  it("parses ISO dates as UTC midnight", () => {
    const d = parseDateUTC("2026-08-25");
    expect(d.toISOString()).toBe("2026-08-25T00:00:00.000Z");
  });

  it("starts the week on Monday (Sunday rolls back)", () => {
    expect(startOfWeekMonday("2026-08-25")).toBe("2026-08-24"); // Tue → Mon
    expect(startOfWeekMonday("2026-08-23")).toBe("2026-08-17"); // Sun → prior Mon
    expect(startOfWeekMonday("2026-08-24")).toBe("2026-08-24"); // Mon
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-08-25", -1)).toBe("2026-08-24");
  });

  it("returns Mon–Fri week dates", () => {
    expect(weekDates("2026-08-24")).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
    ]);
  });

  it("formats day and weekday in UTC", () => {
    expect(formatDay("2026-08-25")).toMatch(/Aug/);
    expect(formatWeekday("2026-08-25")).toBe("Tuesday");
  });
});

describe("trip display helpers", () => {
  it("resolves driver and kid names", () => {
    expect(driverName(drivers, "drv-lucas")).toBe("Lucas");
    expect(driverName(drivers, null)).toBe("Unassigned");
    expect(driverName(drivers, "missing")).toBe("Unknown");
    expect(kidName(kids, "kid-anderson")).toBe("Anderson");
    expect(kidName(kids, "kid-x")).toBe("kid-x");
  });

  it("labels statuses and headlines", () => {
    expect(statusLabel("unassigned")).toBe("Needs driver");
    expect(statusLabel("cancelled")).toBe("No school / cancelled");
    const planned: Trip = {
      id: "t1",
      date: "2026-08-25",
      direction: "AM",
      time: "7:30 AM",
      driverId: "drv-lucas",
      riderIds: ["kid-blake"],
      excludedIds: [],
      status: "planned",
      noSchool: false,
      sheetNote: "Lucas",
    };
    expect(tripHeadline(planned, drivers)).toBe("AM · Lucas");
    expect(
      tripHeadline({ ...planned, noSchool: true, status: "cancelled" }, drivers),
    ).toBe("No school");
  });

  it("formats exclusion notes for (No A) style outs", () => {
    const trip: Trip = {
      id: "t2",
      date: "2026-08-25",
      direction: "PM",
      time: "3:15 PM",
      driverId: null,
      riderIds: ["kid-blake"],
      excludedIds: ["kid-anderson"],
      status: "unassigned",
      noSchool: false,
      sheetNote: "(No A)",
    };
    expect(exclusionNote(trip, kids)).toBe("Out: Anderson");
    expect(exclusionNote({ ...trip, excludedIds: [] }, kids)).toBeNull();
  });
});
