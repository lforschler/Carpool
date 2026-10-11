"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    familyName: "",
    homeAddress: "",
    phone: "",
    inviteToken: "",
    createGroup: false,
    groupName: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        inviteToken: form.inviteToken || undefined,
        groupName: form.groupName || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setPending(false);
      setError(json.error || "Signup failed");
      return;
    }
    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setPending(false);
    if (login?.error) {
      setError("Account created — please sign in");
      router.push("/login");
      return;
    }
    router.push("/family");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
        Family account
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Creates your family profile (kids + home address) in the carpool group.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {(
          [
            ["name", "Your name", "text"],
            ["email", "Email", "email"],
            ["password", "Password (min 6)", "password"],
            ["familyName", "Family name", "text"],
            ["homeAddress", "Home address", "text"],
            ["phone", "Phone (optional)", "tel"],
            ["inviteToken", "Invite token (optional)", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block space-y-1 text-sm">
            <span className="font-bold">{label}</span>
            <input
              type={type}
              required={!["phone", "inviteToken"].includes(key)}
              minLength={key === "password" ? 6 : undefined}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
            />
          </label>
        ))}

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.createGroup}
            onChange={(e) =>
              setForm((f) => ({ ...f, createGroup: e.target.checked }))
            }
          />
          Create a new carpool group instead of joining the sample one
        </label>
        {form.createGroup && (
          <label className="block space-y-1 text-sm">
            <span className="font-bold">Group name</span>
            <input
              value={form.groupName}
              onChange={(e) =>
                setForm((f) => ({ ...f, groupName: e.target.value }))
              }
              className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
            />
          </label>
        )}

        {error && (
          <p className="text-sm font-semibold text-[var(--warn)]">{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full rounded-xl bg-[var(--accent)] font-bold text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[var(--accent)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
