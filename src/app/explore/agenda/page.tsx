"use client";

import { useMemo, useState } from "react";
import { ExploreShell } from "@/components/explore/Shell";
import { TripEditor } from "@/components/explore/TripEditor";
import {
  driverName,
  exclusionNote,
  formatDay,
  kidName,
  statusLabel,
} from "@/lib/format";
import { useSchedule } from "@/lib/schedule-store";

const ANCHOR = "2026-10-12";

function groupLabel(date: string): string {
  if (date === ANCHOR) return "Today";
  if (date === "2026-10-13") return "Tomorrow";
  return formatDay(date);
}

export default function AgendaExplorePage() {
  const { trips, data } = useSchedule();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const upcoming = trips
      .filter((t) => t.date >= ANCHOR)
      .sort((a, b) =>
        a.date === b.date
          ? a.direction === "AM"
            ? -1
            : 1
          : a.date.localeCompare(b.date),
      );
    const map = new Map<string, typeof upcoming>();
    for (const t of upcoming) {
      const key = groupLabel(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [trips]);

  const selected = trips.find((t) => t.id === selectedId) ?? null;

  return (
    <ExploreShell title="Agenda / list" concept="/explore/agenda">
      <div className="mb-4 max-w-2xl sm:mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl">
          Upcoming trips
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Prototype “today” is Mon Oct 12. Tap a row to edit.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-5">
        {groups.map(([label, list], gi) => (
          <section
            key={label}
            className="animate-rise"
            style={{ animationDelay: `${gi * 50}ms` }}
          >
            <h3 className="sticky top-[3.25rem] z-10 -mx-1 mb-2 bg-[color-mix(in_oklab,var(--bg)_92%,white)] px-1 py-1.5 font-[family-name:var(--font-display)] text-base backdrop-blur-sm sm:static sm:bg-transparent sm:text-lg sm:backdrop-blur-none">
              {label}
            </h3>
            <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
              {list.map((trip) => {
                const out = exclusionNote(trip, data.kids);
                return (
                  <li key={trip.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(trip.id)}
                      className="flex w-full touch-manipulation flex-col gap-1.5 px-3 py-3.5 text-left active:bg-[var(--surface)] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 sm:hover:bg-[var(--surface)]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <p className="text-sm font-semibold">
                            {trip.direction} · {trip.time}
                          </p>
                          <span className="text-xs text-[var(--muted)] sm:text-sm sm:font-normal">
                            {formatDay(trip.date)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--muted)] sm:hidden">
                            {statusLabel(trip.status)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm">
                          {trip.noSchool
                            ? "No school"
                            : driverName(data.drivers, trip.driverId)}
                        </p>
                        {!trip.noSchool && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {trip.riderIds.map((id) => (
                              <span
                                key={id}
                                className="rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] text-[var(--accent)]"
                              >
                                {kidName(data.kids, id)}
                              </span>
                            ))}
                            {out && (
                              <span className="rounded-md bg-[var(--warn-soft)] px-1.5 py-0.5 text-[11px] text-[var(--warn)]">
                                {out}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="hidden text-xs uppercase tracking-wide text-[var(--muted)] sm:inline">
                        {statusLabel(trip.status)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </ExploreShell>
  );
}
