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
  const dirChip = trip.direction === "AM" ? "chip-am" : "chip-pm";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_oklab,#14231f_45%,transparent)] p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-editor-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,var(--paper),#f4f8f5)] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-20px_50px_-28px_rgba(20,35,31,0.55)] sm:rounded-[1.6rem] sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--line)] sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
                Edit trip
              </p>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${dirChip}`}
              >
                {trip.direction}
              </span>
            </div>
            <h2
              id="trip-editor-title"
              className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-[1.7rem]"
            >
              {formatDay(trip.date)}
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
            className="min-h-10 shrink-0 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-white"
          >
            Close
          </button>
        </div>

        {trip.noSchool ? (
          <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
            Marked as no school in the sample sheet. Status stays cancelled.
          </p>
        ) : (
          <div className="space-y-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-bold">Driver</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-base sm:text-sm"
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
              <legend className="text-sm font-bold">Riders</legend>
              <div className="grid grid-cols-2 gap-2">
                {kids.map((kid) => {
                  const on = trip.riderIds.includes(kid.id);
                  return (
                    <label
                      key={kid.id}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--accent)]"
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
                      <span className="font-semibold">
                        {kid.name}
                        {kid.short === "A" ? " (A)" : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
              {exclusionNote(trip, kids) && (
                <p className="text-xs font-semibold text-[var(--warn)]">
                  {exclusionNote(trip, kids)} — same idea as sheet “No A”
                </p>
              )}
            </fieldset>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold">Status</span>
              <select
                className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-base sm:text-sm"
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
          <span className="font-semibold text-[var(--ink)]">
            {trip.riderIds.length
              ? trip.riderIds.map((id) => kidName(kids, id)).join(", ")
              : "none"}
          </span>
          . Edits persist across all four concepts.
        </p>
      </div>
    </div>
  );
}
