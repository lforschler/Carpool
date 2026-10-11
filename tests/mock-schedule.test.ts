import { describe, expect, it } from "vitest";
import mock from "@/lib/mock-schedule.json";
import { parseSheetCell } from "@/lib/sheet-parse";

describe("seed mock-schedule.json (PR #2 rider semantics)", () => {
  it("includes only Anderson, Blake, Nico as kids (no Eli/Emily/Andy id)", () => {
    const ids = mock.kids.map((k) => k.id).sort();
    expect(ids).toEqual(["kid-anderson", "kid-blake", "kid-nico"]);
    expect(mock.kids.find((k) => k.id === "kid-anderson")).toMatchObject({
      name: "Anderson",
      short: "Andy",
    });
    expect(mock.families.find((f) => f.id === "fam-jill")?.kidIds).toEqual([]);
  });

  it("has fall 2026 sheet tab metadata and trip volume", () => {
    expect(mock.sheetTab).toBe("2027");
    expect(mock.trips.length).toBe(168);
    const dates = mock.trips.map((t) => t.date).sort();
    expect(dates[0]).toBe("2026-08-25");
    expect(dates[dates.length - 1]).toBe("2026-12-18");
  });

  it("never lists Eli/Emily as riders on any trip", () => {
    const riderIds = new Set(mock.trips.flatMap((t) => t.riderIds));
    expect(riderIds.has("kid-eli")).toBe(false);
    expect(riderIds.has("kid-emily")).toBe(false);
    expect([...riderIds].sort()).toEqual([
      "kid-anderson",
      "kid-blake",
      "kid-nico",
    ]);
  });

  it("excludes Anderson on (No A) trips", () => {
    const noA = mock.trips.filter((t) => /\(no a\)/i.test(t.sheetNote));
    expect(noA.length).toBeGreaterThan(0);
    for (const trip of noA) {
      expect(trip.excludedIds).toContain("kid-anderson");
      expect(trip.riderIds).not.toContain("kid-anderson");
    }
  });

  it("pairs AM/PM directions with expected times", () => {
    for (const trip of mock.trips) {
      expect(["AM", "PM"]).toContain(trip.direction);
      if (trip.direction === "AM") expect(trip.time).toBe("7:30 AM");
      if (trip.direction === "PM") expect(trip.time).toBe("3:15 PM");
    }
  });

  it("keeps no-school trips cancelled with empty riders", () => {
    const noSchool = mock.trips.filter((t) => t.noSchool);
    expect(noSchool.length).toBeGreaterThan(0);
    for (const trip of noSchool) {
      expect(trip.status).toBe("cancelled");
      expect(trip.riderIds).toEqual([]);
      expect(trip.driverId).toBeNull();
    }
  });

  it("re-parses sheet notes into the same rider/driver semantics", () => {
    for (const trip of mock.trips.slice(0, 40)) {
      const parsed = parseSheetCell(trip.sheetNote);
      if (parsed.empty) continue;
      expect(parsed.noSchool).toBe(trip.noSchool);
      expect(parsed.driverId).toBe(trip.driverId);
      expect(parsed.riderIds).toEqual(trip.riderIds);
      expect(parsed.excludedIds).toEqual(trip.excludedIds);
    }
  });
});
