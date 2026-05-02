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
      className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-5"
    >
      <h2 className="font-serif text-xl tracking-tight text-stone-900">
        Contact
      </h2>
      <Field label="Contact name">
        <input
          type="text"
          value={form.contact_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, contact_name: e.target.value }))
          }
          className={inputClass}
        />
      </Field>
      <Field label="Contact email">
        <input
          type="email"
          required
          value={form.contact_email}
          onChange={(e) =>
            setForm((f) => ({ ...f, contact_email: e.target.value }))
          }
          className={inputClass}
        />
      </Field>
      <Field label="Contact phone">
        <input
          type="tel"
          value={form.contact_phone}
          onChange={(e) =>
            setForm((f) => ({ ...f, contact_phone: e.target.value }))
          }
          className={inputClass}
        />
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
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && Date.now() - savedAt < 4000 ? (
          <span className="text-xs text-emerald-700">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-stone-800">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900";
