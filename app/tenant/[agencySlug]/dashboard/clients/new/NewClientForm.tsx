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

export default function NewClientForm({ agencySlug, founderEmail }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [reviewLink, setReviewLink] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
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
          owner_email: ownerEmail.trim() || null,
          owner_phone: ownerPhone.trim() || null,
        }),
      });
      const data = (await res.json()) as {
        client_id?: string;
        error?: string;
      };
      if (!res.ok || !data.client_id) {
        setError(data.error || "Could not create restaurant.");
        setSubmitting(false);
        return;
      }
      window.location.href = `/dashboard/clients/${data.client_id}`;
    } catch (err) {
      console.error("create client failed", err);
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-5"
    >
      <Field label="Business name" required>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Mario's Pizza"
        />
      </Field>

      <Field
        label="Slug"
        required
        hint={
          slugValid
            ? `Review URL: ${agencySlug}.revvue.live/r/${slug}`
            : "Lowercase letters, numbers, hyphens. 2–64 chars."
        }
      >
        <div className="flex items-stretch rounded-xl border border-stone-300 focus-within:border-stone-900 transition-colors overflow-hidden">
          <span className="bg-stone-50 border-r border-stone-200 px-3 py-3 text-stone-500 text-sm flex items-center font-mono">
            /r/
          </span>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="flex-1 px-3 py-3 outline-none bg-transparent text-stone-900 font-mono text-sm"
            placeholder="marios-pizza"
          />
        </div>
      </Field>

      <Field
        label="Google review link"
        required
        hint={
          'Paste the full "Write a review" URL from Google. We extract the place ID for the deep link.'
        }
      >
        <input
          type="url"
          required
          value={reviewLink}
          onChange={(e) => setReviewLink(e.target.value)}
          className={inputClass}
          placeholder="https://search.google.com/local/writereview?placeid=…"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Owner email" hint="Optional. For your records.">
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Owner phone" hint="Optional.">
          <input
            type="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {error}
          {error.toLowerCase().includes("limit") ? (
            <>
              {" "}
              <a
                href={`mailto:${founderEmail}?subject=${encodeURIComponent(
                  "Upgrade Revvue plan"
                )}`}
                className="underline underline-offset-4"
              >
                Email Ven to upgrade.
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-full bg-stone-900 text-stone-50 font-medium py-3 disabled:bg-stone-400 hover:bg-stone-800 transition-colors"
      >
        {submitting ? "Creating…" : "Create restaurant"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-stone-800 flex items-center gap-1">
        {label}
        {required ? (
          <span className="text-stone-400 text-xs">*</span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
      {hint ? <div className="mt-1 text-xs text-stone-500">{hint}</div> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
