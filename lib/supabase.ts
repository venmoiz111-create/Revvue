import { createClient } from "@supabase/supabase-js";

// Public Supabase client. Uses the anon key, which is safe to expose to the
// browser. RLS on the `clients` table restricts reads to status='active' rows.
// Use this client from server components and any public read-only code paths.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.local.example."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
