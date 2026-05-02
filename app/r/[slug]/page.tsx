import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ReviewClient from "./ReviewClient";

// Apex (legacy) review page: revvue.live/r/[slug]
//
// This is the original direct-to-restaurant flow. It must keep working
// unchanged from the customer's perspective. Existing clients have been
// backfilled to the default 'revvue' agency, so they now inherit Revvue
// branding — visually identical to before.
//
// We use supabaseAdmin (server-only) instead of the anon client because
// the new RLS policy on `clients` is membership-scoped. Public review
// pages are unauthenticated; using the service role here is the cleanest
// way to keep them working without weakening RLS.
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = { slug: string };

export default async function RestaurantReviewPage({
  params,
}: {
  params: Params;
}) {
  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, google_review_link, status, agency_id")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    // Logging-only; still show the 404 so the customer doesn't see a stack trace.
    console.error("Supabase lookup failed for slug:", params.slug, error);
    notFound();
  }

  if (!client) {
    notFound();
  }

  // Look up branding from the owning agency. Falls back to Revvue defaults
  // if the row is somehow orphaned (e.g. a manual import that skipped the
  // backfill).
  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("name, logo_url, primary_color, font_family")
    .eq("agency_id", client.agency_id as string)
    .maybeSingle();

  return (
    <ReviewClient
      clientId={client.client_id as string}
      businessName={client.business_name as string}
      googleReviewLink={client.google_review_link as string}
      branding={{
        agencyName: (agency?.name as string) || "Revvue",
        logoUrl: (agency?.logo_url as string | null) ?? null,
        primaryColor: (agency?.primary_color as string) || "#1c1917",
        fontFamily: (agency?.font_family as string) || "serif",
      }}
    />
  );
}
