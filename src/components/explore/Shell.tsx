"use client";

import Link from "next/link";
import { useSchedule } from "@/lib/schedule-store";

const CONCEPTS = [
  { href: "/explore/drivers", label: "Drivers" },
  { href: "/explore/table", label: "Table" },
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
            href="/week"
            className="shrink-0 font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--accent-deep)] sm:text-xl"
          >
            Carpool
          </Link>
          <span className="hidden h-4 w-px bg-[var(--line)] sm:inline-block" />
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--muted)] sm:flex-none sm:text-base">
            Explore · {title}
          </h1>
          <nav className="ml-auto flex items-center gap-1.5">
            <Link
              href="/week"
              className="rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-xs font-semibold text-white sm:text-sm"
            >
              Schedule
            </Link>
            {CONCEPTS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`hidden rounded-lg px-2.5 py-1.5 text-sm font-semibold transition sm:inline ${
                  concept === c.href
                    ? "bg-white text-[var(--ink)]"
                    : "bg-white/50 text-[var(--muted)] hover:bg-white"
                }`}
              >
                {c.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={resetTrips}
              disabled={!hydrated}
              className="rounded-lg border border-[var(--line)] bg-white/50 px-2 py-1 text-[11px] font-semibold text-[var(--muted)] sm:px-2.5 sm:py-1.5 sm:text-sm"
            >
              Reset
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
        aria-label="Explore concepts"
      >
        <div className="grid grid-cols-3">
          <Link
            href="/week"
            className="flex min-h-12 flex-col items-center justify-center text-[11px] font-extrabold text-[var(--accent-deep)]"
          >
            Schedule
          </Link>
          {CONCEPTS.map((c) => {
            const active = concept === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`flex min-h-12 flex-col items-center justify-center text-[11px] font-extrabold ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
