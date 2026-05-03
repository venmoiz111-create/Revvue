"use client";

import { useEffect, useMemo, useState } from "react";

const SLUG_RE = /^[a-z0-9-]{2,64}$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

type Props = {
  agencySlug: string;
  founderEmail: string;
};

export default function NewClientForm({ agencySlug }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [showSlug, setShowSlug] = useState(false);
  const [reviewLink, setReviewLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slugTouched) return;
    const next = slugify(name);
    setSlug((s) => (s === next ? s : next));
  }, [name, slugTouched]);

  const slugValid = useMemo(() => SLUG_RE.test(slug), [slug]);
  const linkValid = useMemo(() => {
    if (!reviewLink.trim()) return false;
    try {
      const u = new URL(reviewLink);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, [reviewLink]);
  const formValid = name.trim().length > 1 && slugValid && linkValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business_name: name.trim(),
          slug: slug.trim(),
          google_review_link: reviewLink.trim(),
          owner_email: null,
          owner_phone: null,
        }),
      });
      const data = (await res.json()) as { client_id?: string; error?: string };
      if (!res.ok || !data.client_id) {
        setError(data.error || "Could not create restaurant. Try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = `/dashboard/clients/${data.client_id}`;
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  const previewUrl = slug
    ? `${agencySlug}.revvue.live/r/${slug}`
    : `${agencySlug}.revvue.live/r/…`;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-5"
    >
      {/* Business name */}
      <div>
        <label className="block text-sm font-medium text-stone-800 mb-2">
          Business name <span className="text-stone-400 text-xs">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Mario's Pizza"
          autoFocus
        />
      </div>

      {/* Review URL preview — auto-generated, editable on demand */}
      {slug && (
        <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
          <p className="text-xs text-stone-500 mb-1">Diner review page URL</p>
          <p className="font-mono text-sm text-stone-900 break-all">{previewUrl}</p>
          <button
            type="button"
            onClick={() => setShowSlug((v) => !v)}
            className="mt-1 text-xs text-stone-400 underline underline-offset-4 hover:text-stone-700"
          >
            {showSlug ? "Hide" : "Customize URL"}
          </button>
          {showSlug && (
            <div className="mt-3 flex items-stretch rounded-xl border border-stone-300 focus-within:border-stone-900 transition-colors overflow-hidden">
              <span className="bg-stone-100 border-r border-stone-200 px-3 py-2.5 text-stone-500 text-xs flex items-center font-mono">
                /r/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                className="flex-1 px-3 py-2.5 outline-none bg-transparent text-stone-900 font-mono text-sm"
                placeholder="marios-pizza"
              />
            </div>
          )}
        </div>
      )}

      {/* Google review link */}
      <div>
        <label className="block text-sm font-medium text-stone-800 mb-2">
          Google review link <span className="text-stone-400 text-xs">*</span>
        </label>
        <input
          type="url"
          required
          value={reviewLink}
          onChange={(e) => setReviewLink(e.target.value)}
          className={inputClass}
          placeholder="https://search.google.com/local/writereview?placeid=…"
        />
        <p className="mt-1 text-xs text-stone-500">
          Go to Google Maps → find your business → click &ldquo;Write a review&rdquo; → copy that URL.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-300 hover:bg-stone-800 transition-colors"
      >
        {submitting ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
