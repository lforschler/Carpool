"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/schedule/AppShell";
import { TripEditor } from "@/components/schedule/TripEditor";
import {
  driverName,
  formatDay,
  formatWeekday,
  kidName,
} from "@/lib/format";
import {
  addMonths,
  buildMonthWeekRows,
  formatMonthLabel,
  startOfMonth,
} from "@/lib/month";
import { useSchedule } from "@/lib/schedule-store";
import type { Driver, Kid, Trip } from "@/lib/types";

const SAMPLE_MONTH = "2026-10-01";

function SlotButton({
  trip,
  drivers,
  kids,
  onOpen,
}: {
  trip: Trip | null;
  drivers: Driver[];
  kids: Kid[];
  onOpen: (id: string) => void;
}) {
  if (!trip) {
    return (
      <div className="rounded-lg border border-dashed border-[color-mix(in_oklab,var(--line)_80%,transparent)] px-1.5 py-1.5 text-[10px] text-[var(--muted)]">
        —
      </div>
    );
  }

  const dirChip = trip.direction === "AM" ? "chip-am" : "chip-pm";
  const tone = trip.noSchool
    ? "border-[var(--line)] bg-[var(--surface)]/70 opacity-80"
    : trip.status === "unassigned"
      ? "border-[color-mix(in_oklab,var(--warn)_50%,white)] bg-[var(--warn-soft)]"
      : "border-white/80 bg-[color-mix(in_oklab,var(--paper)_90%,white)] active:border-[var(--accent)] sm:hover:border-[var(--accent)]";

  return (
    <button
      type="button"
      onClick={() => onOpen(trip.id)}
      className={`w-full touch-manipulation rounded-lg border px-1.5 py-1.5 text-left shadow-[0_6px_14px_-14px_rgba(20,35,31,0.5)] transition ${tone}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={`rounded px-1 py-px text-[9px] font-extrabold uppercase tracking-[0.12em] ${dirChip}`}
        >
          {trip.direction}
        </span>
      </div>
      <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-[12px] leading-tight tracking-tight sm:text-[13px]">
        {trip.noSchool
          ? "No school"
          : driverName(drivers, trip.driverId)}
      </p>
      {!trip.noSchool && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {trip.riderIds.length ? (
            trip.riderIds.map((id) => {
              const kid = kids.find((k) => k.id === id);
              return (
                <span
                  key={id}
                  className="rounded bg-[var(--accent-soft)] px-1 py-px text-[9px] font-bold text-[var(--accent-deep)]"
                  title={kidName(kids, id)}
                >
                  {kid?.short ?? kidName(kids, id)}
                </span>
              );
            })
          ) : (
            <span className="text-[9px] text-[var(--muted)]">No riders</span>
          )}
          {trip.excludedIds.map((id) => {
            const kid = kids.find((k) => k.id === id);
            return (
              <span
                key={id}
                className="rounded bg-[var(--warn-soft)] px-1 py-px text-[9px] font-bold text-[var(--warn)]"
                title={`Out: ${kidName(kids, id)}`}
              >
                −{kid?.short ?? kidName(kids, id)}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

export default function MonthPage() {
  const { trips, data } = useSchedule();
  const [monthStart, setMonthStart] = useState(SAMPLE_MONTH);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => buildMonthWeekRows(monthStart, trips),
    [monthStart, trips],
  );

  const selected = trips.find((t) => t.id === selectedId) ?? null;

  return (
    <AppShell tab="/month">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
            Month view
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
            {formatMonthLabel(monthStart)}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            One row per week · AM/PM drivers and rider chips · tap to edit.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold shadow-[0_8px_18px_-16px_rgba(20,35,31,0.5)] touch-manipulation"
            onClick={() => setMonthStart(addMonths(monthStart, -1))}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_-12px_rgba(11,95,82,0.85)] touch-manipulation"
            onClick={() => setMonthStart(startOfMonth(SAMPLE_MONTH))}
          >
            Sample
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold shadow-[0_8px_18px_-16px_rgba(20,35,31,0.5)] touch-manipulation"
            onClick={() => setMonthStart(addMonths(monthStart, 1))}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {rows.map((row, ri) => (
          <section
            key={row.weekStart}
            className="panel animate-rise overflow-hidden rounded-[1.35rem] p-2.5 sm:p-3"
            style={{ animationDelay: `${ri * 40}ms` }}
          >
            <header className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
              <p className="font-[family-name:var(--font-display)] text-base tracking-tight sm:text-lg">
                Week of {formatDay(row.weekStart)}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">
                Mon–Fri
              </p>
            </header>

            <div className="-mx-0.5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-0.5 pb-1 scroll-px-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-5 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
              {row.days.map((day) => (
                <div
                  key={day.date}
                  className={`w-[min(42vw,11rem)] shrink-0 snap-center rounded-xl p-1.5 sm:w-auto sm:snap-none ${
                    day.inMonth
                      ? "bg-[color-mix(in_oklab,var(--paper)_55%,transparent)]"
                      : "bg-[color-mix(in_oklab,var(--surface)_40%,transparent)] opacity-70"
                  }`}
                >
                  <div className="mb-1.5 border-b border-[color-mix(in_oklab,var(--line)_60%,transparent)] pb-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                      {formatWeekday(day.date).slice(0, 3)}
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-sm tracking-tight">
                      {formatDay(day.date)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <SlotButton
                      trip={day.am}
                      drivers={data.drivers}
                      kids={data.kids}
                      onOpen={setSelectedId}
                    />
                    <SlotButton
                      trip={day.pm}
                      drivers={data.drivers}
                      kids={data.kids}
                      onOpen={setSelectedId}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-2 text-center text-[11px] text-[var(--muted)] sm:hidden">
        Swipe within a week for Tue–Fri →
      </p>

      {selected && (
        <TripEditor trip={selected} onClose={() => setSelectedId(null)} />
      )}
    </AppShell>
  );
}
