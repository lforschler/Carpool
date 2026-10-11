"use client";

import { useEffect, useMemo, useState } from "react";
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
const DENSITY_KEY = "carpool-month-density-v1";

type Density = "condensed" | "comfortable";

function isDensity(value: string | null): value is Density {
  return value === "condensed" || value === "comfortable";
}

function SlotButton({
  trip,
  drivers,
  kids,
  density,
  onOpen,
}: {
  trip: Trip | null;
  drivers: Driver[];
  kids: Kid[];
  density: Density;
  onOpen: (id: string) => void;
}) {
  const condensed = density === "condensed";

  if (!trip) {
    return (
      <div
        className={`rounded-lg border border-dashed border-[color-mix(in_oklab,var(--line)_80%,transparent)] text-[10px] text-[var(--muted)] ${
          condensed ? "px-1 py-1" : "px-1.5 py-1.5"
        }`}
      >
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
  const driverLabel = trip.noSchool
    ? "No school"
    : driverName(drivers, trip.driverId);

  return (
    <button
      type="button"
      onClick={() => onOpen(trip.id)}
      className={`w-full touch-manipulation rounded-lg border text-left shadow-[0_6px_14px_-14px_rgba(20,35,31,0.5)] transition ${tone} ${
        condensed ? "px-1 py-1" : "px-1.5 py-1.5"
      }`}
    >
      {condensed ? (
        <p className="flex min-w-0 items-baseline gap-1 leading-tight">
          <span
            className={`shrink-0 rounded px-1 py-px text-[9px] font-extrabold uppercase tracking-[0.12em] ${dirChip}`}
          >
            {trip.direction}
          </span>
          <span className="truncate text-[11px] font-semibold text-[var(--muted)]">
            ·
          </span>
          <span className="truncate font-[family-name:var(--font-display)] text-[12px] tracking-tight">
            {driverLabel}
          </span>
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-1">
            <span
              className={`rounded px-1 py-px text-[9px] font-extrabold uppercase tracking-[0.12em] ${dirChip}`}
            >
              {trip.direction}
            </span>
          </div>
          <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-[12px] leading-tight tracking-tight sm:text-[13px]">
            {driverLabel}
          </p>
        </>
      )}
      {!trip.noSchool && (
        <div className={`flex flex-wrap gap-0.5 ${condensed ? "mt-0.5" : "mt-1"}`}>
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
  const [density, setDensity] = useState<Density>("condensed");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DENSITY_KEY);
      if (isDensity(saved)) setDensity(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DENSITY_KEY, density);
    } catch {
      /* ignore */
    }
  }, [density]);

  const rows = useMemo(
    () => buildMonthWeekRows(monthStart, trips),
    [monthStart, trips],
  );

  const selected = trips.find((t) => t.id === selectedId) ?? null;
  const condensed = density === "condensed";

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
            {condensed
              ? "One row per week · AM · driver on one line, riders below · tap to edit."
              : "One row per week · AM/PM drivers and rider chips · tap to edit."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div
            className="inline-flex rounded-xl border border-white/70 bg-white/80 p-1 shadow-[0_8px_18px_-16px_rgba(20,35,31,0.5)]"
            role="group"
            aria-label="Month density"
          >
            <button
              type="button"
              className={`min-h-9 rounded-lg px-3 text-xs font-extrabold uppercase tracking-wide touch-manipulation ${
                density === "condensed"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)]"
              }`}
              onClick={() => setDensity("condensed")}
              aria-pressed={density === "condensed"}
            >
              Condensed
            </button>
            <button
              type="button"
              className={`min-h-9 rounded-lg px-3 text-xs font-extrabold uppercase tracking-wide touch-manipulation ${
                density === "comfortable"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)]"
              }`}
              onClick={() => setDensity("comfortable")}
              aria-pressed={density === "comfortable"}
            >
              Comfortable
            </button>
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
      </div>

      <div className={condensed ? "space-y-2 sm:space-y-2.5" : "space-y-3 sm:space-y-4"}>
        {rows.map((row, ri) => (
          <section
            key={row.weekStart}
            className={`panel animate-rise overflow-hidden rounded-[1.35rem] ${
              condensed ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3"
            }`}
            style={{ animationDelay: `${ri * 40}ms` }}
          >
            <header
              className={`flex items-baseline justify-between gap-2 px-0.5 ${
                condensed ? "mb-1.5" : "mb-2"
              }`}
            >
              <p
                className={`font-[family-name:var(--font-display)] tracking-tight ${
                  condensed ? "text-[15px] sm:text-base" : "text-base sm:text-lg"
                }`}
              >
                Week of {formatDay(row.weekStart)}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">
                Mon–Fri
              </p>
            </header>

            <div
              className={`-mx-0.5 flex snap-x snap-mandatory overflow-x-auto px-0.5 pb-1 scroll-px-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0 ${
                condensed ? "gap-1.5 sm:gap-1.5" : "gap-2 sm:gap-2"
              }`}
            >
              {row.days.map((day) => (
                <div
                  key={day.date}
                  className={`w-[min(42vw,11rem)] shrink-0 snap-center rounded-xl sm:w-auto sm:snap-none ${
                    condensed ? "p-1" : "p-1.5"
                  } ${
                    day.inMonth
                      ? "bg-[color-mix(in_oklab,var(--paper)_55%,transparent)]"
                      : "bg-[color-mix(in_oklab,var(--surface)_40%,transparent)] opacity-70"
                  }`}
                >
                  <div
                    className={`border-b border-[color-mix(in_oklab,var(--line)_60%,transparent)] ${
                      condensed ? "mb-1 pb-0.5" : "mb-1.5 pb-1"
                    }`}
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                      {formatWeekday(day.date).slice(0, 3)}
                    </p>
                    <p
                      className={`font-[family-name:var(--font-display)] tracking-tight ${
                        condensed ? "text-[13px]" : "text-sm"
                      }`}
                    >
                      {formatDay(day.date)}
                    </p>
                  </div>
                  <div className={condensed ? "space-y-1" : "space-y-1.5"}>
                    <SlotButton
                      trip={day.am}
                      drivers={data.drivers}
                      kids={data.kids}
                      density={density}
                      onOpen={setSelectedId}
                    />
                    <SlotButton
                      trip={day.pm}
                      drivers={data.drivers}
                      kids={data.kids}
                      density={density}
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
