import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Server-side Supabase client bound to the request's cookie store.
// Use this from server components / route handlers / server actions when
// you need the AUTHENTICATED user's session (e.g. dashboard pages, API
// routes that require login).
//
// For unauthenticated public reads (review pages, agency landing) prefer
// `lib/supabase` (anon, no cookies) or `lib/supabaseAdmin` (service role).
export function createSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Setting cookies from a Server Component is not allowed in Next 14.
          // Wrap in try/catch so it's a no-op there; route handlers and
          // middleware can still set cookies normally.
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* read-only context (e.g. RSC) — ignore */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            /* read-only context (e.g. RSC) — ignore */
          }
        },
      },
    }
  );
}
