"use client";

import { useState } from "react";
import Link from "next/link";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";

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
      const loginUrl = `https://${data.slug}.${BASE_DOMAIN}/login?email=${encodeURIComponent(email.trim())}`;
      window.location.href = loginUrl;
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-white">
            Revvue
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and we will take you to your portal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-zinc-800 bg-zinc-950 rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white placeholder-zinc-600"
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 text-red-400 text-sm p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-green-500 text-black font-bold py-3 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:bg-green-400 transition-colors"
          >
            {submitting ? "Finding your portal..." : "Continue →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          No account yet?{" "}
          <Link
            href="/signup"
            className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
