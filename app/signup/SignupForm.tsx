"use client";

import { useEffect, useMemo, useState } from "react";

const SUBDOMAIN_RE = /^[a-z0-9-]{3,32}$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export default function SignupForm() {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    slug: "",
    slugTouched: false,
  });

  useEffect(() => {
    if (form.slugTouched) return;
    const next = slugify(form.name);
    setForm((f) => (f.slug === next ? f : { ...f, slug: next }));
  }, [form.name, form.slugTouched]);

  const slugValid = useMemo(() => SUBDOMAIN_RE.test(form.slug), [form.slug]);
  const formValid =
    form.email.includes("@") &&
    form.password.length >= 8 &&
    form.name.trim().length > 1 &&
    slugValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/agencies/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          slug: form.slug.trim(),
          logo_url: null,
          primary_color: "#000000",
          font_family: "sans-serif",
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        redirectUrl?: string;
      };

      if (!res.ok || !data.success || !data.redirectUrl) {
        setServerError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setServerError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-zinc-800 bg-zinc-950 rounded-2xl p-8 space-y-5"
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-500">
          14-day free trial. No credit card required.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClass}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className={inputClass}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Your business or agency name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Mario's Pizzeria"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Your review portal address
        </label>
        <div className="flex items-stretch rounded-xl border border-zinc-700 focus-within:border-green-500 transition-colors overflow-hidden">
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                slug: slugify(e.target.value),
                slugTouched: true,
              }))
            }
            className="flex-1 px-3 py-3 outline-none bg-transparent text-white placeholder-zinc-600"
            placeholder="marios-pizzeria"
          />
          <span className="bg-zinc-900 border-l border-zinc-700 px-3 py-3 text-zinc-500 text-sm flex items-center whitespace-nowrap">
            .revvue.live
          </span>
        </div>
        {slugValid && form.slug ? (
          <p className="mt-1 text-xs text-zinc-500">
            Your review pages will live at{" "}
            <span className="font-mono text-green-500">{form.slug}.revvue.live</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-600">
            3 to 32 lowercase letters, numbers, or hyphens.
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 text-red-400 text-sm p-3">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-full bg-green-500 text-black font-bold py-3 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:bg-green-400 transition-colors"
      >
        {submitting ? "Creating your portal…" : "Create my portal →"}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        No credit card required. Customise your branding from the dashboard.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white placeholder-zinc-600";
