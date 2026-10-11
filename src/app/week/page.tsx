"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/schedule/AppShell";
import { TripCard } from "@/components/schedule/TripCard";
import { TripEditor } from "@/components/schedule/TripEditor";
import {
  addDays,
  formatDay,
  formatWeekday,
  startOfWeekMonday,
  weekDates,
} from "@/lib/format";
import { useSchedule } from "@/lib/schedule-store";

export default function WeekPage() {
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
    <AppShell tab="/week">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
            Primary view
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
            Week of {formatDay(weekStart)}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            <span className="sm:hidden">Swipe days · tap a trip to edit.</span>
            <span className="hidden sm:inline">
              Tap any AM/PM cell to edit. Same editor as Agenda.
            </span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold shadow-[0_8px_18px_-16px_rgba(20,35,31,0.5)] touch-manipulation"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(11,95,82,0.85)] touch-manipulation"
            onClick={() => setWeekStart(startOfWeekMonday("2026-10-12"))}
          >
            Sample
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold shadow-[0_8px_18px_-16px_rgba(20,35,31,0.5)] touch-manipulation"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scroll-px-3 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {days.map((d, i) => {
          const dayTrips = byDay.get(d) ?? [];
          return (
            <section
              key={d}
              className="panel animate-rise w-[min(82vw,20rem)] shrink-0 snap-center rounded-[1.35rem] p-3 max-sm:snap-center sm:w-auto sm:snap-none"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <header className="mb-2 border-b border-[color-mix(in_oklab,var(--line)_70%,transparent)] pb-2">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {formatWeekday(d)}
                </p>
                <p className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                  {formatDay(d)}
                </p>
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
    </AppShell>
  );
}
