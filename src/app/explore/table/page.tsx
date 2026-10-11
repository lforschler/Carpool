"use client";

import { useMemo, useState } from "react";
import { ExploreShell } from "@/components/explore/Shell";
import { TripEditor } from "@/components/explore/TripEditor";
import { formatDay, kidName, statusLabel } from "@/lib/format";
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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Trip spreadsheet
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Inline driver / status edits. Tap riders for the full editor.
            Horizontal scroll on narrow screens.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setFilter("oct")}
            className={`rounded-md px-3 py-1.5 ${
              filter === "oct"
                ? "bg-[var(--accent)] text-white"
                : "bg-white border border-[var(--line)]"
            }`}
          >
            October
          </button>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1.5 ${
              filter === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-white border border-[var(--line)]"
            }`}
          >
            All weeks
          </button>
        </div>
      </div>

      <div className="animate-fade overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        <table className="min-w-[48rem] w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
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
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDay(trip.date)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-[var(--accent)]">
                    {trip.direction}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{trip.time}</td>
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
                    {trip.sheetNote}
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
