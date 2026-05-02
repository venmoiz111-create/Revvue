import "server-only";
import { createClient } from "@supabase/supabase-js";

// Privileged Supabase client — bypasses RLS. SERVER ONLY.
// Import only inside API routes / server actions. The `server-only` import
// will hard-fail the build if this module is ever pulled into client code.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.local.example."
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
