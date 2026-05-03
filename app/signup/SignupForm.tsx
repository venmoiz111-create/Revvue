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
          primary_color: "#1c1917",
          font_family: "serif",
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
      className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 space-y-5"
    >
      <div>
        <h1 className="font-serif text-2xl tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-stone-500">
          Restaurant or agency — 14-day free trial, no credit card.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-800 mb-2">Email</label>
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
        <label className="block text-sm font-medium text-stone-800 mb-2">Password</label>
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
        <label className="block text-sm font-medium text-stone-800 mb-2">
          Your business name
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
        <label className="block text-sm font-medium text-stone-800 mb-2">
          Your review portal address
        </label>
        <div className="flex items-stretch rounded-xl border border-stone-300 focus-within:border-stone-900 transition-colors overflow-hidden">
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
            className="flex-1 px-3 py-3 outline-none bg-transparent text-stone-900"
            placeholder="marios-pizzeria"
          />
          <span className="bg-stone-50 border-l border-stone-200 px-3 py-3 text-stone-500 text-sm flex items-center whitespace-nowrap">
            .revvue.live
          </span>
        </div>
        {slugValid && form.slug ? (
          <p className="mt-1 text-xs text-stone-500">
            Your review pages will live at{" "}
            <span className="font-mono text-stone-700">{form.slug}.revvue.live</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-stone-400">
            3–32 lowercase letters, numbers, or hyphens.
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
      >
        {submitting ? "Creating your portal…" : "Create my portal →"}
      </button>

      <p className="text-xs text-stone-400 text-center">
        No credit card required. You can customise your branding from the dashboard.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
