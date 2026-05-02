import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type DashboardContext = {
  userId: string;
  email: string;
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  plan: string;
  trialEndsAt: string | null;
  paidUntil: string | null;
  maxClients: number;
};

// Standard dashboard server-side context lookup.
//
// The dashboard layout already gates on auth + membership, but every
// dashboard page also needs the agency_id (and other small fields) to
// scope its queries. Rather than re-implementing auth checks in every
// page, this helper does the same checks and returns a typed context.
//
// Returns by redirecting to /login if anything is missing — pages can
// just `const ctx = await loadDashboardContext(slug)` and trust it.
export async function loadDashboardContext(
  agencySlug: string
): Promise<DashboardContext> {
  const supa = createSupabaseServer();

  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/login");

  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select(
      "agency_id, slug, name, plan, trial_ends_at, paid_until, max_clients"
    )
    .eq("slug", agencySlug)
    .maybeSingle();

  if (!agency) redirect("/login");

  const { data: membership } = await supabaseAdmin
    .from("agency_users")
    .select("role")
    .eq("agency_id", agency.agency_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/login");

  return {
    userId: user.id,
    email: user.email ?? "",
    agencyId: agency.agency_id as string,
    agencySlug: agency.slug as string,
    agencyName: agency.name as string,
    plan: (agency.plan as string) ?? "trial",
    trialEndsAt: (agency.trial_ends_at as string | null) ?? null,
    paidUntil: (agency.paid_until as string | null) ?? null,
    maxClients: (agency.max_clients as number) ?? 3,
  };
}
