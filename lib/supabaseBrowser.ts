"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Use this from any client component that
// needs to call Supabase Auth (signInWithPassword, signOut, etc.).
//
// Cookie scope note: we deliberately do NOT set a Domain attribute on the
// auth cookies. This means each agency subdomain (acme.revvue.live,
// bob.revvue.live, etc.) gets its own isolated session cookie. A login
// session on one agency's subdomain is invisible to other tenants — that
// is the right default for tenant isolation.
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
