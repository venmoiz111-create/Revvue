"use client";

import { useState } from "react";

type Props = { clientId: string };

export default function DeleteClientButton({ clientId }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not delete.");
        setSubmitting(false);
        return;
      }
      window.location.href = "/dashboard/clients";
    } catch (err) {
      console.error("delete failed", err);
      setError("Network error.");
      setSubmitting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-zinc-600 hover:text-red-400 transition-colors"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-800/50 bg-red-950/30 px-3 py-2 text-sm">
      <span className="text-red-300 text-xs">Delete this business? Reviews stay logged.</span>
      <button
        type="button"
        disabled={submitting}
        onClick={handleDelete}
        className="rounded-full bg-red-700 text-red-50 px-3 py-1 text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Deleting..." : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-zinc-700 text-zinc-400 px-3 py-1 text-xs hover:text-white transition-colors"
      >
        Cancel
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
