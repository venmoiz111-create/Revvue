"use client";

import { useEffect, useState } from "react";
import { useAgencyBranding } from "@/components/AgencyBrandingProvider";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginForm() {
  const branding = useAgencyBranding();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("email");
    if (pre) setEmail(pre);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseBrowser();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) {
        setError(
          signInErr.message?.toLowerCase().includes("invalid")
            ? "Wrong email or password."
            : signInErr.message || "Login failed."
        );
        setSubmitting(false);
        return;
      }
      const { data: membership } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("agency_id", branding.agencyId)
        .maybeSingle();
      if (!membership) {
        await supabase.auth.signOut();
        setError(
          `That account is not a member of ${branding.agencyName}. Check the subdomain or contact your admin.`
        );
        setSubmitting(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("login failed:", err);
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  const { agencyName, logoUrl, primaryColor, fontFamily } = branding;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={agencyName}
              className="h-10 w-auto mx-auto object-contain"
            />
          ) : (
            <p
              className="text-sm tracking-widest uppercase text-zinc-500"
              style={{ fontFamily }}
            >
              {agencyName}
            </p>
          )}
          <h1
            className="mt-3 text-3xl font-black tracking-tight text-white"
            style={{ fontFamily }}
          >
            Sign in
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            to your {agencyName} dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-zinc-800 bg-zinc-950 rounded-2xl p-8 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-300">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white placeholder-zinc-600"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-300">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 px-3 py-3 outline-none focus:border-green-500 transition-colors bg-transparent text-white"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 text-red-400 text-sm p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full font-bold py-3 text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: primaryColor || "#22c55e", color: primaryColor ? "white" : "black" }}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          No account?{" "}
          <a
            href={`https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live"}/signup`}
            className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
          >
            Sign up at revvue.live
          </a>
        </p>
      </div>
    </main>
  );
}
