import "server-only";
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AuthorizedAgency = {
  userId: string;
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  plan: string;
  maxClients: number;
};

// Authorize an API request and return the caller's agency context.
//
// Returns either:
//   - { ok: true,  ctx: AuthorizedAgency }  — request is authenticated
//                                              and the user belongs to an
//                                              active agency.
//   - { ok: false, response: NextResponse } — already-formed JSON 401/403
//                                              response the route should
//                                              return verbatim.
//
// We purposely DO NOT trust the URL or Host header to determine which
// agency the call is for — we trust only the authenticated user's
// agency_users membership. The dashboard sidebar can only switch tabs
// within one agency anyway.
export async function authorizeAgency(): Promise<
  { ok: true; ctx: AuthorizedAgency } | { ok: false; response: NextResponse }
> {
  const supa = createSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  // We pick the user's first agency. The schema currently models a single
  // active agency per user, but the join table allows for multi-agency
  // membership in the future. If/when that lands we'll want a header or
  // session field to disambiguate.
  const { data: membership } = await supabaseAdmin
    .from("agency_users")
    .select("agency_id, agencies!inner(agency_id, slug, name, plan, max_clients, status)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  type MembershipRow = {
    agency_id: string;
    agencies: {
      agency_id: string;
      slug: string;
      name: string;
      plan: string;
      max_clients: number;
      status: string;
    };
  };
  const m = membership as unknown as MembershipRow | null;

  if (!m || !m.agencies || m.agencies.status !== "active") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No active agency for this user." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      agencyId: m.agencies.agency_id,
      agencySlug: m.agencies.slug,
      agencyName: m.agencies.name,
      plan: m.agencies.plan,
      maxClients: m.agencies.max_clients,
    },
  };
}
