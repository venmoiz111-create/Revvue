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
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-5">
        <Field label="Agency name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field
          label="Logo URL"
          hint="Logo upload coming soon. Paste a URL for now (Imgur or Cloudinary work great)."
        >
          <input
            type="url"
            value={form.logo_url}
            onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
            className={inputClass}
            placeholder="https://i.imgur.com/yourlogo.png"
          />
        </Field>

        <Field label="Primary color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
              className="h-11 w-16 rounded-lg border border-zinc-700 cursor-pointer bg-zinc-900"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
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
                  onClick={() => setForm((f) => ({ ...f, font_family: opt }))}
                  className={[
                    "flex-1 rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-green-500 bg-green-500/10 text-white"
                      : "border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-500",
                  ].join(" ")}
                  style={{ fontFamily: opt }}
                >
                  <div className="text-xs uppercase tracking-widest opacity-60">
                    {opt === "serif" ? "Serif" : "Sans"}
                  </div>
                  <div className="text-sm mt-0.5">Your business name</div>
                </button>
              );
            })}
          </div>
        </Field>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 text-red-400 text-sm p-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-green-500 text-black font-bold px-5 py-2.5 text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {savedAt && Date.now() - savedAt < 4000 && (
            <span className="text-xs text-green-500">Saved.</span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-zinc-600 font-semibold mb-4">
          Live preview
        </div>
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: form.primary_color + "12", border: `1px solid ${form.primary_color}30` }}
        >
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt={form.name} className="h-10 w-auto mx-auto object-contain" />
          ) : (
            <p className="text-sm tracking-widest uppercase text-zinc-500">{form.name}</p>
          )}
          <h3
            className="mt-2 text-2xl text-white tracking-tight"
            style={{ fontFamily: form.font_family }}
          >
            {"Mario's Pizza"}
          </h3>
          <p className="mt-2 text-zinc-500 text-sm">
            Tell us how your meal was. Hold the button and speak.
          </p>
          <button
            type="button"
            tabIndex={-1}
            className="mt-5 inline-flex items-center justify-center rounded-full text-white px-6 py-3 text-sm cursor-default font-medium"
            style={{ backgroundColor: form.primary_color }}
          >
            Hold to speak
          </button>
          <p className="mt-5 text-[11px] tracking-widest uppercase text-zinc-700">
            Powered by {form.name}
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-zinc-300">{label}</div>
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1 text-xs text-zinc-600">{hint}</div>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white placeholder-zinc-600";
