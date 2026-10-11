"use client";

import { useMemo, useState } from "react";
import { ExploreShell } from "@/components/explore/Shell";
import { TripEditor } from "@/components/explore/TripEditor";
import {
  driverName,
  formatDay,
  kidName,
  statusLabel,
} from "@/lib/format";
import { useSchedule } from "@/lib/schedule-store";
import type { TripStatus } from "@/lib/types";

const STATUSES: TripStatus[] = [
  "planned",
  "confirmed",
  "unassigned",
  "cancelled",
];

export default function TableExplorePage() {
  const { trips, data, updateTrip } = useSchedule();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "oct">("oct");

  const rows = useMemo(() => {
    const list =
      filter === "oct"
        ? trips.filter((t) => t.date >= "2026-10-01" && t.date <= "2026-10-31")
        : trips;
    return [...list].sort((a, b) =>
      a.date === b.date
        ? a.direction === "AM"
          ? -1
          : 1
        : a.date.localeCompare(b.date),
    );
  }, [trips, filter]);

  const selected = trips.find((t) => t.id === selectedId) ?? null;

  return (
    <ExploreShell title="Edit-heavy table" concept="/explore/table">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
            Trip spreadsheet
          </h2>
          <p className="text-sm text-[var(--muted)]">
            <span className="sm:hidden">
              Stacked edit cards on phone. Tap riders for the full editor.
            </span>
            <span className="hidden sm:inline">
              Inline driver / status edits. Tap riders for the full editor.
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
          <button
            type="button"
            onClick={() => setFilter("oct")}
            className={`min-h-11 rounded-xl px-3 py-2 font-semibold touch-manipulation ${
              filter === "oct"
                ? "bg-[var(--accent)] text-white shadow-[0_8px_18px_-12px_rgba(11,95,82,0.85)]"
                : "border border-white/70 bg-white/80"
            }`}
          >
            October
          </button>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`min-h-11 rounded-xl px-3 py-2 font-semibold touch-manipulation ${
              filter === "all"
                ? "bg-[var(--accent)] text-white shadow-[0_8px_18px_-12px_rgba(11,95,82,0.85)]"
                : "border border-white/70 bg-white/80"
            }`}
          >
            All weeks
          </button>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {rows.map((trip) => {
          const capacity =
            data.drivers.find((d) => d.id === trip.driverId)?.seatCapacity ?? 5;
          const seatsLeft = trip.noSchool
            ? "—"
            : Math.max(0, capacity - trip.riderIds.length);
          const dirChip = trip.direction === "AM" ? "chip-am" : "chip-pm";
          return (
            <article
              key={trip.id}
              className="panel animate-fade rounded-[1.35rem] p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${dirChip}`}
                    >
                      {trip.direction}
                    </span>
                    <p className="font-[family-name:var(--font-display)] text-base tracking-tight">
                      {formatDay(trip.date)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
                    {trip.time}
                  </p>
                </div>
                <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  {seatsLeft === "—" ? "n/a" : `${seatsLeft} seats`}
                </span>
              </div>

              {trip.noSchool ? (
                <p className="mt-3 text-sm text-[var(--muted)]">No school</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  <label className="block text-xs text-[var(--muted)]">
                    Driver
                    <select
                      className="mt-1 min-h-11 w-full rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm text-[var(--ink)]"
                      value={trip.driverId ?? ""}
                      onChange={(e) =>
                        updateTrip(trip.id, {
                          driverId: e.target.value || null,
                          status: e.target.value ? "planned" : "unassigned",
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {data.drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedId(trip.id)}
                    className="w-full rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-soft)]/70 px-3 py-2.5 text-left text-sm touch-manipulation"
                  >
                    <span className="block text-xs font-semibold text-[var(--muted)]">
                      Riders · tap to edit
                    </span>
                    <span className="font-bold text-[var(--accent-deep)]">
                      {trip.riderIds
                        .map((id) => kidName(data.kids, id))
                        .join(", ") || "None"}
                    </span>
                  </button>
                  <label className="block text-xs text-[var(--muted)]">
                    Status
                    <select
                      className="mt-1 min-h-11 w-full rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm text-[var(--ink)]"
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
                  {trip.sheetNote && (
                    <p className="text-xs text-[var(--muted)]">
                      Sheet: {trip.sheetNote}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="animate-fade hidden overflow-x-auto rounded-[1.35rem] border border-white/70 bg-[color-mix(in_oklab,var(--paper)_92%,white)] shadow-[0_14px_30px_-22px_rgba(20,35,31,0.45)] sm:block">
        <table className="min-w-[48rem] w-full border-collapse text-left text-sm">
          <thead className="bg-[linear-gradient(90deg,var(--accent-soft),var(--am-soft))] text-xs font-extrabold uppercase tracking-wide text-[var(--accent-deep)]">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Dir</th>
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Driver</th>
              <th className="px-3 py-2 font-medium">Riders</th>
              <th className="px-3 py-2 font-medium">Seats left</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Sheet note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((trip) => {
              const capacity =
                data.drivers.find((d) => d.id === trip.driverId)
                  ?.seatCapacity ?? 5;
              const seatsLeft = trip.noSchool
                ? "—"
                : Math.max(0, capacity - trip.riderIds.length);
              return (
                <tr
                  key={trip.id}
                  className="border-t border-[var(--line)] hover:bg-[var(--surface)]/60"
                >
                  <td className="whitespace-nowrap px-3 py-2">
                    {formatDay(trip.date)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-[var(--accent)]">
                    {trip.direction}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{trip.time}</td>
                  <td className="px-3 py-2">
                    {trip.noSchool ? (
                      "—"
                    ) : (
                      <select
                        className="w-full min-w-[8rem] rounded-md border border-[var(--line)] bg-white px-2 py-1"
                        value={trip.driverId ?? ""}
                        onChange={(e) =>
                          updateTrip(trip.id, {
                            driverId: e.target.value || null,
                            status: e.target.value ? "planned" : "unassigned",
                          })
                        }
                      >
                        <option value="">Unassigned</option>
                        {data.drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(trip.id)}
                      className="max-w-[14rem] truncate text-left text-[var(--accent)] underline-offset-2 hover:underline"
                      title="Edit riders"
                    >
                      {trip.noSchool
                        ? "No school"
                        : trip.riderIds
                            .map((id) => kidName(data.kids, id))
                            .join(", ") || "None"}
                    </button>
                  </td>
                  <td className="px-3 py-2">{seatsLeft}</td>
                  <td className="px-3 py-2">
                    {trip.noSchool ? (
                      statusLabel("cancelled")
                    ) : (
                      <select
                        className="rounded-md border border-[var(--line)] bg-white px-2 py-1"
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
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--muted)]">
                    {trip.sheetNote || driverName(data.drivers, trip.driverId)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </ExploreShell>
  );
}
