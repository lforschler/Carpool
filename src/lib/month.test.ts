import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Trip } from "./types";
import {
  addMonths,
  buildMonthWeekRows,
  endOfMonth,
  formatMonthLabel,
  startOfMonth,
  weeksOverlappingMonth,
} from "./month";

function trip(
  partial: Pick<Trip, "id" | "date" | "direction"> & Partial<Trip>,
): Trip {
  return {
    time: partial.direction === "AM" ? "7:45 AM" : "3:15 PM",
    driverId: null,
    riderIds: [],
    excludedIds: [],
    status: "unassigned",
    noSchool: false,
    sheetNote: "",
    ...partial,
  };
}

describe("startOfMonth / endOfMonth / addMonths", () => {
  it("normalizes to the first of the month", () => {
    assert.equal(startOfMonth("2026-10-15"), "2026-10-01");
    assert.equal(startOfMonth("2026-10-01"), "2026-10-01");
  });

  it("finds the last calendar day", () => {
    assert.equal(endOfMonth("2026-10-15"), "2026-10-31");
    assert.equal(endOfMonth("2026-02-10"), "2026-02-28");
  });

  it("shifts months landing on the 1st", () => {
    assert.equal(addMonths("2026-10-15", -1), "2026-09-01");
    assert.equal(addMonths("2026-10-01", 1), "2026-11-01");
    assert.equal(addMonths("2026-12-01", 1), "2027-01-01");
  });
});

describe("formatMonthLabel", () => {
  it("formats a long month + year in UTC", () => {
    assert.equal(formatMonthLabel("2026-10-12"), "October 2026");
  });
});

describe("weeksOverlappingMonth", () => {
  it("returns Monday starts for school weeks that touch October 2026", () => {
    // Oct 2026: Thu 1 … Sat 31. First school week starts Mon Sep 28;
    // last school week with Oct days starts Mon Oct 26.
    assert.deepEqual(weeksOverlappingMonth("2026-10-01"), [
      "2026-09-28",
      "2026-10-05",
      "2026-10-12",
      "2026-10-19",
      "2026-10-26",
    ]);
  });

  it("includes a partial first week when month starts mid-week", () => {
    // Sep 2026 starts Tuesday — first Monday is Aug 31.
    const weeks = weeksOverlappingMonth("2026-09-01");
    assert.equal(weeks[0], "2026-08-31");
    assert.ok(weeks.includes("2026-09-28"));
  });
});

describe("buildMonthWeekRows", () => {
  it("groups AM/PM trips onto school-day cells and marks in-month", () => {
    const trips = [
      trip({ id: "1", date: "2026-10-01", direction: "AM", driverId: "drv-a" }),
      trip({ id: "2", date: "2026-10-01", direction: "PM", driverId: "drv-b" }),
      trip({ id: "3", date: "2026-09-30", direction: "AM", driverId: "drv-c" }),
    ];

    const rows = buildMonthWeekRows("2026-10-01", trips);
    assert.equal(rows.length, 5);

    const first = rows[0];
    assert.equal(first.weekStart, "2026-09-28");
    // Mon Sep 28 — outside October
    assert.equal(first.days[0].date, "2026-09-28");
    assert.equal(first.days[0].inMonth, false);
    // Wed Sep 30 has AM
    assert.equal(first.days[2].date, "2026-09-30");
    assert.equal(first.days[2].inMonth, false);
    assert.equal(first.days[2].am?.id, "3");
    // Thu Oct 1 — in month, both slots
    assert.equal(first.days[3].date, "2026-10-01");
    assert.equal(first.days[3].inMonth, true);
    assert.equal(first.days[3].am?.id, "1");
    assert.equal(first.days[3].pm?.id, "2");
  });

  it("leaves empty slots null when no trip exists", () => {
    const rows = buildMonthWeekRows("2026-10-01", []);
    const mid = rows.find((r) => r.weekStart === "2026-10-12");
    assert.ok(mid);
    for (const day of mid.days) {
      assert.equal(day.am, null);
      assert.equal(day.pm, null);
      assert.equal(day.inMonth, true);
    }
  });
});
