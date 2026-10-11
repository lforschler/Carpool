"use client";

import Link from "next/link";
import { useSchedule } from "@/lib/schedule-store";

const CONCEPTS = [
  { href: "/explore/week", label: "Week", short: "Week" },
  { href: "/explore/agenda", label: "Agenda", short: "List" },
  { href: "/explore/drivers", label: "Drivers", short: "Drive" },
  { href: "/explore/table", label: "Table", short: "Table" },
] as const;

export function ExploreShell({
  title,
  concept,
  children,
}: {
  title: string;
  concept?: (typeof CONCEPTS)[number]["href"];
  children: React.ReactNode;
}) {
  const { resetTrips, hydrated } = useSchedule();

  return (
    <div className="min-h-dvh text-[var(--ink)] pb-[calc(4.35rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-[color-mix(in_oklab,var(--paper)_72%,transparent)] pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-20px_rgba(20,35,31,0.55)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <Link
            href="/explore"
            className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--accent-deep)] sm:text-xl"
          >
            Carpool
          </Link>
          <span className="hidden h-4 w-px bg-[var(--line)] sm:inline-block" />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--muted)] sm:flex-none sm:text-base">
            {title}
          </h1>
          <nav className="ml-auto hidden items-center gap-1.5 sm:flex">
            {CONCEPTS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  concept === c.href
                    ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_-10px_rgba(11,95,82,0.9)]"
                    : "bg-white/70 text-[var(--ink)] hover:bg-white"
                }`}
              >
                {c.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={resetTrips}
              disabled={!hydrated}
              className="rounded-lg border border-[var(--line)] bg-white/50 px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              Reset edits
            </button>
          </nav>
          <button
            type="button"
            onClick={resetTrips}
            disabled={!hydrated}
            className="rounded-lg border border-[var(--line)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] sm:hidden"
            aria-label="Reset edits"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-22px_rgba(20,35,31,0.45)] backdrop-blur-xl sm:hidden"
        aria-label="Concepts"
      >
        <div className="grid grid-cols-4">
          {CONCEPTS.map((c) => {
            const active = concept === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold tracking-wide ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <span
                  className={`h-1 w-7 rounded-full transition ${
                    active ? "bg-[var(--accent)]" : "bg-transparent"
                  }`}
                />
                {c.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
