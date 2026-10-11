import { describe, expect, it } from "vitest";
import {
  ACTIVE_KID_IDS,
  CORE_KIDS,
  KID_ALIASES,
  normalizeNote,
  parseSheetCell,
} from "@/lib/sheet-parse";

describe("sheet rider roster constants", () => {
  it("defaults to Blake + Anderson; Andy aliases to Anderson", () => {
    expect([...CORE_KIDS]).toEqual(["kid-blake", "kid-anderson"]);
    expect(KID_ALIASES.a).toBe("kid-anderson");
    expect(KID_ALIASES.andy).toBe("kid-anderson");
    expect(KID_ALIASES.anderson).toBe("kid-anderson");
  });

  it("does not treat Eli/Emily as active riders", () => {
    expect(ACTIVE_KID_IDS.has("kid-eli")).toBe(false);
    expect(ACTIVE_KID_IDS.has("kid-emily")).toBe(false);
    expect(KID_ALIASES.eli).toBeUndefined();
    expect(KID_ALIASES.emily).toBeUndefined();
  });
});

describe("normalizeNote", () => {
  it("collapses whitespace and fixes Lucas No A) typo", () => {
    expect(normalizeNote("Lucas  No A)")).toBe("Lucas (No A)");
    expect(normalizeNote("  Dee\n\nNico  ")).toBe("Dee Nico");
  });
});

describe("parseSheetCell — schedule domain", () => {
  it("returns empty for blank cells", () => {
    expect(parseSheetCell("")).toEqual({ empty: true });
    expect(parseSheetCell("   ")).toEqual({ empty: true });
  });

  it("parses No School as cancelled with no riders/driver", () => {
    const parsed = parseSheetCell("No School");
    expect(parsed).toMatchObject({
      empty: false,
      noSchool: true,
      driverId: null,
      riderIds: [],
      excludedIds: [],
      status: "cancelled",
      sheetNote: "No School",
    });
  });

  it("assigns AM/PM drivers from sheet names", () => {
    expect(parseSheetCell("Lucas")).toMatchObject({
      driverId: "drv-lucas",
      riderIds: ["kid-blake", "kid-anderson"],
      status: "planned",
      noSchool: false,
    });
    expect(parseSheetCell("Dee")).toMatchObject({ driverId: "drv-dee" });
    expect(parseSheetCell("Jill")).toMatchObject({ driverId: "drv-jill" });
    expect(parseSheetCell("Nicola")).toMatchObject({ driverId: "drv-nicola" });
  });

  it("treats (No A) as Anderson/Andy out", () => {
    const parsed = parseSheetCell("(No A)");
    expect(parsed).toMatchObject({
      empty: false,
      excludedIds: ["kid-anderson"],
      riderIds: ["kid-blake"],
      driverId: null,
      status: "unassigned",
    });
  });

  it("treats (No Andy) the same as (No A)", () => {
    const parsed = parseSheetCell("Lucas (No Andy)");
    expect(parsed).toMatchObject({
      driverId: "drv-lucas",
      excludedIds: ["kid-anderson"],
      riderIds: ["kid-blake"],
      status: "planned",
    });
  });

  it("adds Nico as a guest when named (Lucas Nico & Andy)", () => {
    const parsed = parseSheetCell("Lucas Nico & Andy");
    expect(parsed).toMatchObject({
      driverId: "drv-lucas",
      riderIds: ["kid-blake", "kid-anderson", "kid-nico"],
      excludedIds: [],
      status: "planned",
    });
  });

  it("never includes Eli or Emily from sheet text", () => {
    const parsed = parseSheetCell("Lucas Eli Emily");
    expect(parsed).toMatchObject({
      riderIds: ["kid-blake", "kid-anderson"],
    });
    if (!parsed.empty) {
      expect(parsed.riderIds).not.toContain("kid-eli");
      expect(parsed.riderIds).not.toContain("kid-emily");
    }
  });

  it("supports (No Blake) exclusion", () => {
    const parsed = parseSheetCell("Dee (No Blake)");
    expect(parsed).toMatchObject({
      driverId: "drv-dee",
      excludedIds: ["kid-blake"],
      riderIds: ["kid-anderson"],
    });
  });

  it("marks unassigned when no driver name is present", () => {
    expect(parseSheetCell("Blake only")).toMatchObject({
      driverId: null,
      status: "unassigned",
      riderIds: ["kid-blake", "kid-anderson"],
    });
  });
});
