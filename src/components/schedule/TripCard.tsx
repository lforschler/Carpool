"use client";

import {
  driverName,
  exclusionNote,
  kidName,
  statusLabel,
} from "@/lib/format";
import type { Driver, Kid, Trip } from "@/lib/types";

export function TripCard({
  trip,
  drivers,
  kids,
  onOpen,
  compact = false,
}: {
  trip: Trip;
  drivers: Driver[];
  kids: Kid[];
  onOpen: () => void;
  compact?: boolean;
}) {
  const out = exclusionNote(trip, kids);
  const dirChip = trip.direction === "AM" ? "chip-am" : "chip-pm";
  const tone = trip.noSchool
    ? "border-[var(--line)] bg-[var(--surface)]/80 opacity-75"
    : trip.status === "unassigned"
      ? "border-[color-mix(in_oklab,var(--warn)_55%,white)] bg-[var(--warn-soft)]"
      : "border-white/80 bg-[color-mix(in_oklab,var(--paper)_88%,white)] hover:border-[var(--accent)] active:border-[var(--accent)]";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full touch-manipulation rounded-2xl border px-3 py-3 text-left shadow-[0_8px_20px_-18px_rgba(20,35,31,0.55)] transition duration-200 ${tone} ${
        compact ? "min-h-[4.75rem]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ${dirChip}`}
        >
          {trip.direction}
        </span>
        <span className="text-[11px] font-semibold text-[var(--muted)]">
          {trip.time}
        </span>
      </div>
      <p className="mt-1.5 font-[family-name:var(--font-display)] text-[15px] tracking-tight">
        {trip.noSchool
          ? "No school"
          : driverName(drivers, trip.driverId)}
      </p>
      {!trip.noSchool && (
        <>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--muted)]">
            {trip.riderIds.map((id) => kidName(kids, id)).join(" · ") ||
              "No riders"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
              {statusLabel(trip.status)}
            </span>
            {out && (
              <span className="rounded-md bg-[var(--warn-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--warn)]">
                {out}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  );
}
