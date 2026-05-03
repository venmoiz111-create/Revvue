"use client";

import { useState } from "react";

type Props = {
  initial: {
    contact_name: string;
    contact_email: string;
    contact_phone: string;
  };
};

export default function SettingsForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
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
          contact_name: form.contact_name.trim() || null,
          contact_email: form.contact_email.trim(),
          contact_phone: form.contact_phone.trim() || null,
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
      console.error("settings save failed", err);
      setError("Network error.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-5"
    >
      <h2 className="font-bold text-white text-lg">Contact</h2>

      <Field label="Contact name">
        <input
          type="text"
          value={form.contact_name}
          onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
          className={inputClass}
          placeholder="Your name"
        />
      </Field>

      <Field label="Contact email">
        <input
          type="email"
          required
          value={form.contact_email}
          onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
          className={inputClass}
        />
      </Field>

      <Field label="Contact phone">
        <input
          type="tel"
          value={form.contact_phone}
          onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
          className={inputClass}
          placeholder="+1 416 555 0100"
        />
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
          {saving ? "Saving..." : "Save"}
        </button>
        {savedAt && Date.now() - savedAt < 4000 && (
          <span className="text-xs text-green-500">Saved.</span>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-zinc-300 mb-2">{label}</div>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white placeholder-zinc-600";
