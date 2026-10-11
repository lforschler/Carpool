import Link from "next/link";

const main = [
  {
    href: "/week",
    letter: "A",
    title: "Week calendar",
    blurb: "Main schedule home — glance the week, tap a cell to edit.",
    wash: "from-[#ffe8c4]/80 via-[#fff8ef] to-[#e7f4ee]",
    accent: "text-[#b56a10]",
    badge: "Main app",
  },
  {
    href: "/agenda",
    letter: "B",
    title: "Agenda / list",
    blurb: "Secondary mode — Today & upcoming on the same trip model.",
    wash: "from-[#d9ebf8]/90 via-[#f4faf7] to-[#e8f3ea]",
    accent: "text-[#2f5f8a]",
    badge: "Main app",
  },
] as const;

const reference = [
  {
    href: "/explore/drivers",
    letter: "C",
    title: "Driver-first board",
    blurb: "Deferred concept — kept for reference only.",
    wash: "from-[#cce8e1]/90 via-[#f5fbf8] to-[#eaf3e4]",
    accent: "text-[var(--accent)]",
  },
  {
    href: "/explore/table",
    letter: "D",
    title: "Edit-heavy table",
    blurb: "Deferred concept — kept for reference only.",
    wash: "from-[#f0e4d4]/85 via-[#fff9f1] to-[#e7f1ea]",
    accent: "text-[#7a4e1e]",
  },
] as const;

export default function ExploreChooserPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-12">
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-[40%] bg-[color-mix(in_oklab,var(--sun)_55%,transparent)] blur-2xl"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-10 top-28 h-64 w-64 rounded-[45%] bg-[color-mix(in_oklab,var(--sky)_60%,transparent)] blur-2xl"
        style={{ animationDelay: "-4s" }}
      />

      <div className="relative mx-auto max-w-4xl">
        <p className="animate-fade text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--accent)]">
          Schedule + archive
        </p>
        <h1 className="animate-rise mt-3 font-[family-name:var(--font-display)] text-[3.35rem] leading-[0.92] tracking-[-0.03em] text-[var(--ink)] sm:text-6xl">
          Carpool
        </h1>
        <p
          className="animate-rise mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg"
          style={{ animationDelay: "70ms" }}
        >
          Week + Agenda is the product schedule surface. Driver board and table
          stay here as throwaway references from exploration.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/week"
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-12px_rgba(11,95,82,0.85)]"
          >
            Open schedule →
          </Link>
          <Link
            href="/agenda"
            className="rounded-xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-bold text-[var(--ink)]"
          >
            Agenda
          </Link>
        </div>

        <h2 className="mt-10 font-[family-name:var(--font-display)] text-xl tracking-tight">
          Main hybrid
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {main.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className={`animate-rise group relative flex min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-white/70 bg-gradient-to-br ${c.wash} p-4 shadow-[0_10px_30px_-18px_rgba(20,35,31,0.45)] transition duration-300 sm:p-5 sm:hover:-translate-y-1`}
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <div className="relative">
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={`font-[family-name:var(--font-display)] text-3xl italic tracking-tight ${c.accent}`}
                  >
                    {c.letter}
                  </span>
                  <span className="rounded-lg bg-[var(--accent)] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    {c.badge}
                  </span>
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
                  {c.title}
                </h3>
              </div>
              <p className="relative mt-2 text-sm text-[var(--muted)]">{c.blurb}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-10 font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--muted)]">
          Reference only
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {reference.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className={`animate-rise group relative flex min-h-[7rem] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-dashed border-[var(--line)] bg-gradient-to-br ${c.wash} p-4 opacity-90 transition sm:p-5 sm:hover:opacity-100`}
              style={{ animationDelay: `${220 + i * 70}ms` }}
            >
              <div className="relative">
                <span
                  className={`font-[family-name:var(--font-display)] text-2xl italic ${c.accent}`}
                >
                  {c.letter}
                </span>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-tight">
                  {c.title}
                </h3>
              </div>
              <p className="relative mt-2 text-sm text-[var(--muted)]">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
