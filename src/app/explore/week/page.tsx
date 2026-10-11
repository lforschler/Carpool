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
  // Default to the Oct 12 week (rich Nico/Andy notes) near "today" in sample era
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Week of {formatDay(weekStart)}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Tap any AM/PM cell to edit. Swipe-friendly week arrows below.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            onClick={() =>
              setWeekStart(startOfWeekMonday("2026-10-12"))
            }
          >
            Sample week
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {days.map((d, i) => {
          const dayTrips = byDay.get(d) ?? [];
          return (
            <section
              key={d}
              className="animate-rise rounded-2xl border border-[var(--line)] bg-white/70 p-3"
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

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </ExploreShell>
  );
}
