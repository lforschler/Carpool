"use client";

import { useMemo, useState } from "react";
import { ExploreShell } from "@/components/explore/Shell";
import { TripCard } from "@/components/explore/TripCard";
import { TripEditor } from "@/components/explore/TripEditor";
import {
  addDays,
  formatDay,
  formatWeekday,
  startOfWeekMonday,
  weekDates,
} from "@/lib/format";
import { useSchedule } from "@/lib/schedule-store";

export default function WeekExplorePage() {
  const { trips, data } = useSchedule();
  const [weekStart, setWeekStart] = useState("2026-10-12");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const days = weekDates(weekStart);
  const byDay = useMemo(() => {
    const map = new Map<string, typeof trips>();
    for (const d of days) map.set(d, []);
    for (const t of trips) {
      if (map.has(t.date)) map.get(t.date)!.push(t);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.direction === "AM" ? -1 : 1));
    }
    return map;
  }, [trips, days]);

  const selected = trips.find((t) => t.id === selectedId) ?? null;

  return (
    <ExploreShell title="Week calendar" concept="/explore/week">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl">
            Week of {formatDay(weekStart)}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            <span className="sm:hidden">Swipe days · tap a trip to edit.</span>
            <span className="hidden sm:inline">
              Tap any AM/PM cell to edit. Use arrows for next/prev week.
            </span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium touch-manipulation"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium touch-manipulation"
            onClick={() => setWeekStart(startOfWeekMonday("2026-10-12"))}
          >
            Sample
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium touch-manipulation"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Mobile: horizontal snap carousel of days; desktop: 5-col grid */}
      <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scroll-px-3 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {days.map((d, i) => {
          const dayTrips = byDay.get(d) ?? [];
          return (
            <section
              key={d}
              className="animate-rise w-[min(82vw,20rem)] shrink-0 snap-center rounded-2xl border border-[var(--line)] bg-white/80 p-3 max-sm:snap-center sm:w-auto sm:snap-none"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <header className="mb-2 border-b border-[var(--line)] pb-2">
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  {formatWeekday(d)}
                </p>
                <p className="font-medium">{formatDay(d)}</p>
              </header>
              <div className="space-y-2">
                {dayTrips.length ? (
                  dayTrips.map((t) => (
                    <TripCard
                      key={t.id}
                      trip={t}
                      drivers={data.drivers}
                      kids={data.kids}
                      compact
                      onOpen={() => setSelectedId(t.id)}
                    />
                  ))
                ) : (
                  <p className="px-1 py-6 text-center text-xs text-[var(--muted)]">
                    No trips
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-[var(--muted)] sm:hidden">
        Swipe for Tue–Fri →
      </p>

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </ExploreShell>
  );
}
