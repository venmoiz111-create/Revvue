"use client";

import { useState } from "react";
import Link from "next/link";

const BASE_DOMAIN =
  process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";

export default function LoginLookup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/login-lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { slug?: string; error?: string };

      if (!res.ok || !data.slug) {
        setError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      // Redirect to their portal login with email pre-filled.
      const loginUrl = `https://${data.slug}.${BASE_DOMAIN}/login?email=${encodeURIComponent(email.trim())}`;
      window.location.href = loginUrl;
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl tracking-tight text-stone-900">
            Revvue
          </Link>
          <h1 className="mt-4 font-serif text-3xl tracking-tight text-stone-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Enter your email and we&apos;ll take you to your portal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-400 hover:bg-stone-800 transition-colors"
          >
            {submitting ? "Finding your portal…" : "Continue →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-stone-800"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
