import Link from "next/link";

const concepts = [
  {
    href: "/explore/week",
    letter: "A",
    title: "Week calendar",
    blurb:
      "Days × AM/PM at a glance. Tap a cell to claim a driver, toggle riders, set status.",
    wash: "from-[#ffe8c4]/80 via-[#fff8ef] to-[#e7f4ee]",
    accent: "text-[#b56a10]",
  },
  {
    href: "/explore/agenda",
    letter: "B",
    title: "Agenda / list",
    blurb:
      "Today, tomorrow, then the week — dense and phone-friendly for the next few rides.",
    wash: "from-[#d9ebf8]/90 via-[#f4faf7] to-[#e8f3ea]",
    accent: "text-[#2f5f8a]",
  },
  {
    href: "/explore/drivers",
    letter: "C",
    title: "Driver-first board",
    blurb:
      "Who’s covering what. Move trips onto a driver and edit riders inside each column.",
    wash: "from-[#cce8e1]/90 via-[#f5fbf8] to-[#eaf3e4]",
    accent: "text-[var(--accent)]",
  },
  {
    href: "/explore/table",
    letter: "D",
    title: "Edit-heavy table",
    blurb:
      "Power edits on desktop; stacked edit cards on phone for fast driver/rider changes.",
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
          School-run sketches
        </p>
        <h1 className="animate-rise mt-3 font-[family-name:var(--font-display)] text-[3.35rem] leading-[0.92] tracking-[-0.03em] text-[var(--ink)] sm:text-6xl">
          Carpool
        </h1>
        <p
          className="animate-rise mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg"
          style={{ animationDelay: "70ms" }}
        >
          Four ways to see the same week from your sample sheet — pick the one
          that feels right in the parking lot.
        </p>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {concepts.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className={`animate-rise group relative flex min-h-[8.25rem] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-white/70 bg-gradient-to-br ${c.wash} p-4 shadow-[0_10px_30px_-18px_rgba(20,35,31,0.45)] transition duration-300 active:scale-[0.99] sm:min-h-[10.5rem] sm:p-5 sm:hover:-translate-y-1`}
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/35 blur-xl transition duration-500 group-hover:scale-125"
              />
              <div className="relative">
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className={`font-[family-name:var(--font-display)] text-3xl italic tracking-tight sm:text-4xl ${c.accent}`}
                  >
                    {c.letter}
                  </span>
                  <span className="rounded-lg bg-white/55 px-2.5 py-1 text-xs font-bold text-[var(--ink)] backdrop-blur-sm transition group-hover:bg-white/80">
                    Open
                  </span>
                </div>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
                  {c.title}
                </h2>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {c.blurb}
              </p>
            </Link>
          ))}
        </div>

        <p
          className="animate-fade mt-8 text-sm text-[var(--muted)]"
          style={{ animationDelay: "420ms" }}
        >
          Prototypes only — no auth, database, or SMS.{" "}
          <a
            className="font-semibold text-[var(--accent)] underline decoration-[color-mix(in_oklab,var(--accent)_40%,transparent)] underline-offset-2"
            href="https://docs.google.com/spreadsheets/d/1A_w9-kkoFYO_WLQZaS2KQ6lsJ6pn3nsExurtwoBtems/edit?usp=drivesdk"
            target="_blank"
            rel="noreferrer"
          >
            Sample Google Sheet
          </a>
        </p>
      </div>
    </div>
  );
}
