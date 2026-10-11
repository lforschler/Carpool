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
  const tone = trip.noSchool
    ? "border-[var(--line)] bg-[var(--surface)] opacity-70"
    : trip.status === "unassigned"
      ? "border-[var(--warn)] bg-[var(--warn-soft)]"
      : "border-[var(--line)] bg-white hover:border-[var(--accent)]";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${tone} ${
        compact ? "min-h-[4.5rem]" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          {trip.direction}
        </span>
        <span className="text-[11px] text-[var(--muted)]">{trip.time}</span>
      </div>
      <p className="mt-1 text-sm font-medium">
        {trip.noSchool
          ? "No school"
          : driverName(drivers, trip.driverId)}
      </p>
      {!trip.noSchool && (
        <>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
            {trip.riderIds.map((id) => kidName(kids, id)).join(" · ") ||
              "No riders"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {statusLabel(trip.status)}
            </span>
            {out && (
              <span className="rounded bg-[var(--warn-soft)] px-1.5 py-0.5 text-[10px] text-[var(--warn)]">
                {out}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  );
}
