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
      "Spreadsheet-style rows with inline controls. Strong on desktop; scrolls horizontally on phones.",
  },
] as const;

export default function ExploreChooserPage() {
  return (
    <div className="min-h-dvh px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="animate-fade text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          UI exploration
        </p>
        <h1 className="animate-rise mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
          Carpool
        </h1>
        <p
          className="animate-rise mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg"
          style={{ animationDelay: "60ms" }}
        >
          Compare four schedule concepts using your real sample sheet (families,
          AM/PM trips, No School, “No A”). Edits stay in this browser so you can
          switch concepts and compare.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {concepts.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className="animate-rise group rounded-2xl border border-[var(--line)] bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                  {c.letter}
                </span>
                <span className="text-sm text-[var(--muted)] transition group-hover:text-[var(--accent)]">
                  Open →
                </span>
              </div>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
                {c.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {c.blurb}
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--muted)]">
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
