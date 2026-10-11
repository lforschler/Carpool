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
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--ink)] pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_90%,white)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <Link
            href="/explore"
            className="shrink-0 font-[family-name:var(--font-display)] text-base tracking-tight text-[var(--ink)] sm:text-lg"
          >
            Carpool
          </Link>
          <span className="hidden text-[var(--muted)] sm:inline">/</span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--muted)] sm:flex-none sm:text-base">
            {title}
          </h1>
          <nav className="ml-auto hidden items-center gap-2 sm:flex">
            {CONCEPTS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                  concept === c.href
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {c.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={resetTrips}
              disabled={!hydrated}
              className="rounded-md border border-[var(--line)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              Reset edits
            </button>
          </nav>
          <button
            type="button"
            onClick={resetTrips}
            disabled={!hydrated}
            className="rounded-md border border-[var(--line)] px-2 py-1 text-[11px] text-[var(--muted)] sm:hidden"
            aria-label="Reset edits"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">{children}</main>

      {/* Phone bottom nav — thumb-reachable concept switcher */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_94%,white)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
        aria-label="Concepts"
      >
        <div className="grid grid-cols-4">
          {CONCEPTS.map((c) => {
            const active = concept === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <span
                  className={`h-1 w-6 rounded-full ${
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
