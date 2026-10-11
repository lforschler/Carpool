"use client";

import Link from "next/link";
import { useSchedule } from "@/lib/schedule-store";

const CONCEPTS = [
  { href: "/explore/week", label: "Week" },
  { href: "/explore/agenda", label: "Agenda" },
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
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,white)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href="/explore"
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]"
          >
            Carpool
          </Link>
          <span className="hidden text-[var(--muted)] sm:inline">/</span>
          <h1 className="text-sm font-medium text-[var(--muted)] sm:text-base">
            {title}
          </h1>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {CONCEPTS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
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
              className="rounded-md border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)] sm:text-sm"
            >
              Reset edits
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:py-8">{children}</main>
    </div>
  );
}
