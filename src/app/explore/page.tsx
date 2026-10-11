import Link from "next/link";

const concepts = [
  {
    href: "/explore/week",
    letter: "A",
    title: "Week calendar",
    blurb:
      "Days × AM/PM grid. Tap a cell to assign a driver, toggle riders, set status. Best for the whole week at a glance.",
  },
  {
    href: "/explore/agenda",
    letter: "B",
    title: "Agenda / list",
    blurb:
      "Chronological trip list with Today / Tomorrow grouping. Dense and phone-friendly for the next few rides.",
  },
  {
    href: "/explore/drivers",
    letter: "C",
    title: "Driver-first board",
    blurb:
      "Columns by driver (plus Unassigned). Move trips onto a driver and edit riders inside each card.",
  },
  {
    href: "/explore/table",
    letter: "D",
    title: "Edit-heavy table",
    blurb:
      "Spreadsheet on desktop; stacked edit cards on phone for fast driver/rider changes.",
  },
] as const;

export default function ExploreChooserPage() {
  return (
    <div className="min-h-dvh px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <p className="animate-fade text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          UI exploration
        </p>
        <h1 className="animate-rise mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
          Carpool
        </h1>
        <p
          className="animate-rise mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)] sm:text-lg"
          style={{ animationDelay: "60ms" }}
        >
          Compare four schedule concepts on your phone or desktop using the
          sample sheet. Edits stick in this browser so you can switch and
          compare.
        </p>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
          {concepts.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className="animate-rise group flex min-h-[7.5rem] flex-col justify-between rounded-2xl border border-[var(--line)] bg-white/85 p-4 shadow-sm transition active:border-[var(--accent)] sm:min-h-0 sm:p-5 sm:hover:-translate-y-0.5 sm:hover:border-[var(--accent)] sm:hover:shadow-md"
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--accent)] sm:text-3xl">
                    {c.letter}
                  </span>
                  <span className="text-sm font-medium text-[var(--accent)] sm:text-[color:var(--muted)] sm:group-hover:text-[var(--accent)]">
                    Open →
                  </span>
                </div>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-tight sm:mt-2 sm:text-xl">
                  {c.title}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {c.blurb}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-6 text-sm text-[var(--muted)] sm:mt-8">
          No auth, database, or SMS in this phase — prototypes only. Source:{" "}
          <a
            className="underline decoration-[var(--accent)] underline-offset-2"
            href="https://docs.google.com/spreadsheets/d/1A_w9-kkoFYO_WLQZaS2KQ6lsJ6pn3nsExurtwoBtems/edit?usp=drivesdk"
            target="_blank"
            rel="noreferrer"
          >
            sample Google Sheet
          </a>
          .
        </p>
      </div>
    </div>
  );
}
