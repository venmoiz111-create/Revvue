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

  // Pre-fill email if redirected from revvue.live/login
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
        // Map Supabase error codes to friendlier copy.
        if (signInErr.message?.toLowerCase().includes("invalid")) {
          setError("Wrong email or password.");
        } else {
          setError(signInErr.message || "Login failed.");
        }
        setSubmitting(false);
        return;
      }

      // Membership check: confirm this user actually belongs to this agency.
      // Without this, a user with a valid Supabase account on a different
      // agency could log in here and the dashboard would just bounce them.
      // The dashboard layout enforces this server-side too; this is a
      // friendlier UX-side check.
      const { data: membership } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("agency_id", branding.agencyId)
        .maybeSingle();

      if (!membership) {
        await supabase.auth.signOut();
        setError(
          `That account isn't a member of ${branding.agencyName}. Check the subdomain or contact your admin.`
        );
        setSubmitting(false);
        return;
      }

      // Hard navigation so the dashboard layout reads the new auth cookie.
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("login failed:", err);
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  const { agencyName, logoUrl, primaryColor, fontFamily } = branding;

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center px-6 py-10">
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
            <p className="text-sm tracking-widest uppercase text-stone-500">
              {agencyName}
            </p>
          )}
          <h1
            className="mt-3 text-3xl text-stone-900 tracking-tight"
            style={{ fontFamily }}
          >
            Sign in
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-medium text-stone-800">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-800">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 outline-none focus:border-stone-900 transition-colors bg-white text-stone-900"
            />
          </label>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-3">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full text-stone-50 font-medium py-3 disabled:opacity-60 transition-transform active:scale-[0.99]"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <a
            href={`https://${
              process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live"
            }/signup`}
            className="underline underline-offset-4 hover:text-stone-800"
          >
            Sign up at revvue.live
          </a>
        </p>
      </div>
    </main>
  );
}
