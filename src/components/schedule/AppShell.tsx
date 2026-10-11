"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useSchedule } from "@/lib/schedule-store";

const TABS = [
  { href: "/week", label: "Week", short: "Week" },
  { href: "/agenda", label: "Agenda", short: "Agenda" },
] as const;

export function AppShell({
  tab,
  children,
}: {
  tab: (typeof TABS)[number]["href"] | "/family";
  children: React.ReactNode;
}) {
  const { resetTrips, hydrated, persistMode, error } = useSchedule();
  const { data: session } = useSession();

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
          <p className="hidden text-sm font-semibold text-[var(--muted)] sm:inline">
            Schedule
          </p>
          {persistMode === "db" && (
            <span className="hidden rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--accent-deep)] sm:inline">
              Saved to DB
            </span>
          )}

          <nav className="ml-auto hidden items-center gap-1.5 sm:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  tab === t.href
                    ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_-10px_rgba(11,95,82,0.9)]"
                    : "bg-white/70 text-[var(--ink)] hover:bg-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
            <Link
              href="/family"
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                tab === "/family"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-white/70 text-[var(--ink)] hover:bg-white"
              }`}
            >
              Family
            </Link>
            <button
              type="button"
              onClick={resetTrips}
              disabled={!hydrated}
              className="rounded-lg border border-[var(--line)] bg-white/50 px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              Reset
            </button>
            {session?.user ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                title={session.user.email}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--muted)]"
              >
                Sign in
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:hidden">
            <Link
              href="/family"
              className="rounded-lg border border-[var(--line)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]"
            >
              Family
            </Link>
            <button
              type="button"
              onClick={resetTrips}
              disabled={!hydrated}
              className="rounded-lg border border-[var(--line)] bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]"
              aria-label="Reset edits"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-[var(--warn)]/30 bg-[var(--warn-soft)] px-3 py-2 text-center text-sm font-semibold text-[var(--warn)] sm:px-4">
          {error}
          {session?.user ? " Use Sign out, then sign in again." : null}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/60 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-22px_rgba(20,35,31,0.45)] backdrop-blur-xl sm:hidden"
        aria-label="Schedule"
      >
        <div className="grid grid-cols-2">
          {TABS.map((t) => {
            const active = tab === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[12px] font-extrabold tracking-wide ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <span
                  className={`h-1 w-8 rounded-full transition ${
                    active ? "bg-[var(--accent)]" : "bg-transparent"
                  }`}
                />
                {t.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
