"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/schedule/AppShell";

type Child = {
  id: string;
  name: string;
  shortName: string | null;
  school: string | null;
  grade: string | null;
};

type Family = {
  id: string;
  name: string;
  homeAddress: string;
  phone: string | null;
  children: Child[];
  group: { name: string; inviteToken: string };
};

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [kidName, setKidName] = useState("");

  async function load() {
    const res = await fetch("/api/family");
    if (!res.ok) {
      setError("Could not load family");
      return;
    }
    setFamily(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveFamily(e: FormEvent) {
    e.preventDefault();
    if (!family) return;
    setSaving(true);
    const res = await fetch("/api/family", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: family.name,
        homeAddress: family.homeAddress,
        phone: family.phone,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setFamily(await res.json());
  }

  async function addKid(e: FormEvent) {
    e.preventDefault();
    if (!kidName.trim()) return;
    const res = await fetch("/api/family/kids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: kidName.trim() }),
    });
    if (!res.ok) {
      setError("Could not add kid");
      return;
    }
    setKidName("");
    await load();
  }

  async function removeKid(id: string) {
    await fetch(`/api/family/kids/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <AppShell tab="/week">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
          Your family
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Kids & home address
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Visible to members of your carpool group. Edits save to Postgres.
        </p>

        {!family && !error && (
          <p className="mt-6 text-sm text-[var(--muted)]">Loading…</p>
        )}
        {error && (
          <p className="mt-4 text-sm font-semibold text-[var(--warn)]">{error}</p>
        )}

        {family && (
          <div className="mt-6 space-y-6">
            <p className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm">
              Group: <strong>{family.group.name}</strong>
              <span className="mt-1 block text-xs text-[var(--muted)]">
                Invite token: <code>{family.group.inviteToken}</code>
              </span>
            </p>

            <form onSubmit={saveFamily} className="panel space-y-3 rounded-[1.35rem] p-4">
              <label className="block space-y-1 text-sm">
                <span className="font-bold">Family name</span>
                <input
                  value={family.name}
                  onChange={(e) =>
                    setFamily({ ...family, name: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-bold">Home address</span>
                <input
                  value={family.homeAddress}
                  onChange={(e) =>
                    setFamily({ ...family, homeAddress: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-bold">Phone</span>
                <input
                  value={family.phone ?? ""}
                  onChange={(e) =>
                    setFamily({ ...family, phone: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 rounded-xl bg-[var(--accent)] px-4 font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save family"}
              </button>
            </form>

            <section className="panel rounded-[1.35rem] p-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl">
                Kids
              </h2>
              <ul className="mt-3 space-y-2">
                {family.children.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => void removeKid(c.id)}
                      className="text-xs font-bold text-[var(--warn)]"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {!family.children.length && (
                  <li className="text-sm text-[var(--muted)]">No kids yet.</li>
                )}
              </ul>
              <form onSubmit={addKid} className="mt-4 flex gap-2">
                <input
                  value={kidName}
                  onChange={(e) => setKidName(e.target.value)}
                  placeholder="Kid name"
                  className="min-h-11 flex-1 rounded-xl border border-[var(--line)] bg-white px-3 text-sm"
                />
                <button
                  type="submit"
                  className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-white"
                >
                  Add
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
