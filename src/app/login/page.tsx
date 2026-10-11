"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/week";
  const [email, setEmail] = useState("lucas@carpool.local");
  const [password, setPassword] = useState("carpool123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Sign-in failed — check email/password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block space-y-1.5 text-sm">
        <span className="font-bold">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
        />
      </label>
      <label className="block space-y-1.5 text-sm">
        <span className="font-bold">Password</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3"
        />
      </label>
      {error && (
        <p className="text-sm font-semibold text-[var(--warn)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-xl bg-[var(--accent)] font-bold text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
        Family account
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Demo seed: <code>lucas@carpool.local</code> / <code>carpool123</code>
      </p>
      <Suspense fallback={<p className="mt-6 text-sm">Loading…</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-sm text-[var(--muted)]">
        New family?{" "}
        <Link href="/signup" className="font-bold text-[var(--accent)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
