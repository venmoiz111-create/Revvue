"use client";

import { useState } from "react";

type Branding = {
  name: string;
  logo_url: string;
  primary_color: string;
  font_family: "serif" | "sans-serif";
};

type Props = { initial: Branding };

export default function BrandingForm({ initial }: Props) {
  const [form, setForm] = useState<Branding>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/agencies/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          logo_url: form.logo_url.trim() || null,
          primary_color: form.primary_color,
          font_family: form.font_family,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not save.");
        setSaving(false);
        return;
      }
      setSavedAt(Date.now());
      setSaving(false);
    } catch (err) {
      console.error("branding save failed", err);
      setError("Network error.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-5">
        <Field label="Agency name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            className={inputClass}
          />
        </Field>
        <Field
          label="Logo URL"
          hint="Logo upload is coming soon — paste a URL for now (we recommend Imgur or Cloudinary)."
        >
          <input
            type="url"
            value={form.logo_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, logo_url: e.target.value }))
            }
            className={inputClass}
            placeholder="https://i.imgur.com/yourlogo.png"
          />
        </Field>
        <Field label="Primary color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) =>
                setForm((f) => ({ ...f, primary_color: e.target.value }))
              }
              className="h-12 w-16 rounded-md border border-stone-300 cursor-pointer bg-white"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) =>
                setForm((f) => ({ ...f, primary_color: e.target.value }))
              }
              className={inputClass}
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </Field>
        <Field label="Font">
          <div className="flex gap-3">
            {(["serif", "sans-serif"] as const).map((opt) => {
              const active = form.font_family === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, font_family: opt }))
                  }
                  className={[
                    "flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-stone-900 bg-stone-900 text-stone-50"
                      : "border-stone-300 bg-white hover:border-stone-500",
                  ].join(" ")}
                  style={{ fontFamily: opt }}
                >
                  <div className="text-xs uppercase tracking-widest opacity-70">
                    {opt === "serif" ? "Serif" : "Sans"}
                  </div>
                  <div className="text-base">Your business name</div>
                </button>
              );
            })}
          </div>
        </Field>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-stone-900 text-stone-50 font-medium px-5 py-2.5 text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {savedAt && Date.now() - savedAt < 4000 ? (
            <span className="text-xs text-emerald-700">Saved.</span>
          ) : null}
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-stone-100 rounded-2xl p-6 border border-stone-200">
        <div className="text-xs uppercase tracking-widest text-stone-500 mb-3">
          Live preview
        </div>
        <div className="rounded-2xl bg-gradient-to-b from-stone-50 to-stone-100 border border-stone-200 p-8 text-center">
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.logo_url}
              alt={form.name}
              className="h-10 w-auto mx-auto object-contain"
            />
          ) : (
            <p className="text-sm tracking-widest uppercase text-stone-500">
              {form.name}
            </p>
          )}
          <h3
            className="mt-2 text-3xl text-stone-900 tracking-tight"
            style={{ fontFamily: form.font_family }}
          >
            Mario&apos;s Pizza
          </h3>
          <p className="mt-3 text-stone-600 text-sm">
            Tell us how your meal was. Hold the button and speak.
          </p>
          <button
            type="button"
            tabIndex={-1}
            className="mt-5 inline-flex items-center justify-center rounded-full text-stone-50 px-6 py-3 text-sm cursor-default"
            style={{ backgroundColor: form.primary_color }}
          >
            Hold to speak
          </button>
          <p className="mt-6 text-[11px] tracking-widest uppercase text-stone-400">
            Powered by {form.name}
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-stone-800">{label}</div>
      <div className="mt-2">{children}</div>
      {hint ? <div className="mt-1 text-xs text-stone-500">{hint}</div> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
