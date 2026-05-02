import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ReviewClient from "@/app/r/[slug]/ReviewClient";

// Customer-facing review page on an agency subdomain:
//   acme.revvue.live/r/marios-pizza
//
// This is PUBLIC and unauthenticated. It must keep working even if the
// agency's trial has expired or their plan is unpaid — review pages are
// the agency's promise to their restaurant clients, not a billing surface.
//
// We re-fetch the agency here (rather than reading it from the layout's
// context) because this is a server component and we need the agency_id
// to scope the clients query. This is a cheap query and Next will dedupe
// inside a single render.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { agencySlug: string; slug: string };

export default async function AgencyReviewPage({
  params,
}: {
  params: Params;
}) {
  // Agency: anon client is fine, public RLS policy allows reading active
  // agencies and the layout already 404s on unknown/inactive subdomains.
  const { data: agency, error: agencyErr } = await supabase
    .from("agencies")
    .select("agency_id, name, logo_url, primary_color, font_family")
    .eq("slug", params.agencySlug)
    .eq("status", "active")
    .maybeSingle();

  if (agencyErr) {
    console.error("Agency lookup failed:", params.agencySlug, agencyErr);
    notFound();
  }
  if (!agency) notFound();

  // Clients: anon RLS now requires agency_users membership. Public review
  // pages are unauthenticated, so we use the service-role client. This is
  // safe because the customer never sees the response — only the matched
  // row's display fields make it into the client component.
  const { data: client, error: clientErr } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, google_review_link, status")
    .eq("slug", params.slug)
    .eq("agency_id", agency.agency_id)
    .eq("status", "active")
    .maybeSingle();

  if (clientErr) {
    console.error(
      "Client lookup failed for",
      params.agencySlug,
      params.slug,
      clientErr
    );
    notFound();
  }
  if (!client) notFound();

  return (
    <ReviewClient
      clientId={client.client_id as string}
      businessName={client.business_name as string}
      googleReviewLink={client.google_review_link as string}
      branding={{
        agencyName: agency.name as string,
        logoUrl: (agency.logo_url as string | null) ?? null,
        primaryColor: (agency.primary_color as string) || "#1c1917",
        fontFamily: (agency.font_family as string) || "serif",
      }}
    />
  );
}
