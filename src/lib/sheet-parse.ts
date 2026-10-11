/**
 * Sheet cell parsing rules for the Westwood carpool spreadsheet.
 * Mirrors scripts/import-sheet-2027.py — keep in sync when rider rules change.
 *
 * Rider rules:
 * - Default riders: Blake + Anderson (Andy). Sheet "A"/"Andy" = Anderson Brewer.
 * - "(No A)" means Anderson/Andy is not riding.
 * - Eli and Emily are not carpool riders.
 * - Nico may appear as a guest rider from sheet notes.
 */

export const DRIVER_MAP: Record<string, string> = {
  lucas: "drv-lucas",
  dee: "drv-dee",
  jill: "drv-jill",
  nicola: "drv-nicola",
};

/** Default carpool riders. Weis (Eli/Emily) are contacts-only — not riders. */
export const CORE_KIDS = ["kid-blake", "kid-anderson"] as const;

export const ACTIVE_KID_IDS = new Set([
  "kid-blake",
  "kid-anderson",
  "kid-nico",
]);

export const KID_ALIASES: Record<string, string> = {
  a: "kid-anderson",
  anderson: "kid-anderson",
  andy: "kid-anderson",
  blake: "kid-blake",
  nico: "kid-nico",
};

export type ParsedSheetCell =
  | { empty: true }
  | {
      empty: false;
      noSchool: boolean;
      driverId: string | null;
      riderIds: string[];
      excludedIds: string[];
      status: "planned" | "unassigned" | "cancelled";
      sheetNote: string;
    };

export function normalizeNote(raw: string): string {
  let s = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/ *\n */g, "\n").trim();
  s = s.replace("Lucas No A)", "Lucas (No A)");
  s = s.replace(/\s+/g, " ");
  return s;
}

export function parseSheetCell(raw: string): ParsedSheetCell {
  const note = normalizeNote(raw);
  if (!note) return { empty: true };

  const lower = note.toLowerCase();
  if (lower.includes("no school")) {
    return {
      empty: false,
      noSchool: true,
      driverId: null,
      riderIds: [],
      excludedIds: [],
      status: "cancelled",
      sheetNote: "No School",
    };
  }

  let driverId: string | null = null;
  for (const [name, did] of Object.entries(DRIVER_MAP)) {
    if (new RegExp(`\\b${name}\\b`).test(lower)) {
      driverId = did;
      break;
    }
  }

  const excluded: string[] = [];
  for (const m of lower.matchAll(/\(\s*no\s+([^)]+)\)/g)) {
    const chunk = m[1]
      .replace(/ or /g, " ")
      .replace(/&/g, " ")
      .replace(/,/g, " ");
    for (const token of chunk.split(/\s+/)) {
      const kid = KID_ALIASES[token.trim()];
      if (kid && ACTIVE_KID_IDS.has(kid) && !excluded.includes(kid)) {
        excluded.push(kid);
      }
    }
  }

  const guests: string[] = [];
  if (/\bnico\b/.test(lower) && !excluded.includes("kid-nico")) {
    guests.push("kid-nico");
  }

  const riders = [
    ...CORE_KIDS.filter((k) => !excluded.includes(k)),
    ...guests.filter((g) => !excluded.includes(g) && !CORE_KIDS.includes(g as (typeof CORE_KIDS)[number])),
  ];

  return {
    empty: false,
    noSchool: false,
    driverId,
    riderIds: riders,
    excludedIds: excluded,
    status: driverId === null ? "unassigned" : "planned",
    sheetNote: note,
  };
}
