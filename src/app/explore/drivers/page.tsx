"use client";

import { useMemo, useState } from "react";
import { ExploreShell } from "@/components/explore/Shell";
import { TripEditor } from "@/components/explore/TripEditor";
import {
  exclusionNote,
  formatDay,
  kidName,
  statusLabel,
} from "@/lib/format";
import { useSchedule } from "@/lib/schedule-store";

const WINDOW_START = "2026-10-05";
const WINDOW_END = "2026-10-16";

export default function DriversExplorePage() {
  const { trips, data, updateTrip } = useSchedule();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const windowTrips = useMemo(
    () =>
      trips.filter(
        (t) =>
          t.date >= WINDOW_START &&
          t.date <= WINDOW_END &&
          !t.noSchool,
      ),
    [trips],
  );

  const columns = useMemo(() => {
    const unassigned = windowTrips.filter((t) => !t.driverId);
    const byDriver = data.drivers.map((d) => ({
      driver: d,
      trips: windowTrips.filter((t) => t.driverId === d.id),
    }));
    return [{ driver: null, trips: unassigned }, ...byDriver];
  }, [windowTrips, data.drivers]);

  const selected = trips.find((t) => t.id === selectedId) ?? null;

  return (
    <ExploreShell title="Driver-first board" concept="/explore/drivers">
      <div className="mb-3 sm:mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl">
          Who’s covering Oct 5–16
        </h2>
        <p className="text-sm text-[var(--muted)]">
          <span className="sm:hidden">Swipe columns · move trips below.</span>
          <span className="hidden sm:inline">
            Move a trip to another driver with the dropdown, or open it to edit
            riders and status.
          </span>
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--bg)] to-transparent sm:hidden" />
        <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scroll-px-3 sm:mx-0 sm:snap-none sm:px-0">
          {columns.map((col, i) => (
            <section
              key={col.driver?.id ?? "unassigned"}
              className="animate-rise flex max-h-[70dvh] w-[min(78vw,17.5rem)] shrink-0 snap-center flex-col rounded-2xl border border-[var(--line)] bg-white/85 p-3 sm:w-[min(85vw,18rem)] sm:max-h-none sm:snap-none"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <header className="mb-3 shrink-0 border-b border-[var(--line)] pb-2">
                <h3 className="font-[family-name:var(--font-display)] text-lg">
                  {col.driver?.name ?? "Unassigned"}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {col.trips.length} trip{col.trips.length === 1 ? "" : "s"}
                </p>
              </header>
              <div className="space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                {col.trips.length === 0 && (
                  <p className="py-6 text-center text-xs text-[var(--muted)]">
                    Empty
                  </p>
                )}
                {col.trips.map((trip) => {
                  const out = exclusionNote(trip, data.kids);
                  return (
                    <article
                      key={trip.id}
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3"
                    >
                      <button
                        type="button"
                        className="w-full touch-manipulation text-left"
                        onClick={() => setSelectedId(trip.id)}
                      >
                        <p className="text-sm font-semibold">
                          {formatDay(trip.date)} · {trip.direction}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-[var(--muted)]">
                          {trip.riderIds
                            .map((id) => kidName(data.kids, id))
                            .join(" · ") || "No riders"}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                          {statusLabel(trip.status)}
                          {out ? ` · ${out}` : ""}
                        </p>
                      </button>
                      <label className="mt-2 block text-[11px] text-[var(--muted)]">
                        Move to
                        <select
                          className="mt-1 min-h-10 w-full rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm text-[var(--ink)]"
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
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </ExploreShell>
  );
}
