"use client";

import { useEffect } from "react";
import { useSchedule } from "@/lib/schedule-store";
import {
  exclusionNote,
  formatDay,
  kidName,
  statusLabel,
} from "@/lib/format";
import type { Trip, TripStatus } from "@/lib/types";

const STATUSES: TripStatus[] = [
  "planned",
  "confirmed",
  "unassigned",
  "cancelled",
];

export function TripEditor({
  trip,
  onClose,
}: {
  trip: Trip;
  onClose: () => void;
}) {
  const { data, updateTrip } = useSchedule();
  const { drivers, kids } = data;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-editor-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--bg)] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 shadow-xl sm:rounded-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--line)] sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Edit trip
            </p>
            <h2
              id="trip-editor-title"
              className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl"
            >
              {formatDay(trip.date)} · {trip.direction}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {trip.time}
              {trip.sheetNote ? (
                <span className="block sm:inline">
                  {" "}
                  · Sheet: “{trip.sheetNote}”
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            Close
          </button>
        </div>

        {trip.noSchool ? (
          <p className="rounded-lg bg-[var(--surface)] px-3 py-2 text-sm">
            Marked as no school in the sample sheet. Status stays cancelled.
          </p>
        ) : (
          <div className="space-y-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Driver</span>
              <select
                className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base sm:text-sm"
                value={trip.driverId ?? ""}
                onChange={(e) =>
                  updateTrip(trip.id, {
                    driverId: e.target.value || null,
                    status: e.target.value ? "planned" : "unassigned",
                  })
                }
              >
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Riders</legend>
              <div className="grid grid-cols-2 gap-2">
                {kids.map((kid) => {
                  const on = trip.riderIds.includes(kid.id);
                  return (
                    <label
                      key={kid.id}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={on}
                        onChange={() => {
                          const riderIds = on
                            ? trip.riderIds.filter((id) => id !== kid.id)
                            : [...trip.riderIds, kid.id];
                          const excludedIds = on
                            ? Array.from(
                                new Set([...trip.excludedIds, kid.id]),
                              )
                            : trip.excludedIds.filter((id) => id !== kid.id);
                          updateTrip(trip.id, { riderIds, excludedIds });
                        }}
                      />
                      <span>
                        {kid.name}
                        {kid.short === "A" ? " (A)" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
              {exclusionNote(trip, kids) && (
                <p className="text-xs text-[var(--warn)]">
                  {exclusionNote(trip, kids)} — same idea as sheet “No A”
                </p>
              )}
            </fieldset>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Status</span>
              <select
                className="min-h-11 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base sm:text-sm"
                value={trip.status}
                onChange={(e) =>
                  updateTrip(trip.id, {
                    status: e.target.value as TripStatus,
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
          Riding:{" "}
          {trip.riderIds.length
            ? trip.riderIds.map((id) => kidName(kids, id)).join(", ")
            : "none"}
          . Edits persist across all four concepts.
        </p>
      </div>
    </div>
  );
}
