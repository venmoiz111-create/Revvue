import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AgencyBrandingProvider from "@/components/AgencyBrandingProvider";
import { brandingFromRow } from "@/lib/agencyBranding";

// Tenant root layout.
//
// This layout wraps EVERY page under {agency}.revvue.live (review pages,
// dashboard, login, etc.) so we only hit Supabase once per request to load
// branding + status. If the subdomain doesn't resolve to an active agency,
// we 404 here and nothing nested ever runs.
//
// Path note: this folder is named `tenant` (not `_tenant`) because the
// Next.js App Router excludes underscore-prefixed folders from the route
// table. Direct apex access to /tenant/* is blocked in middleware.ts so
// this segment is effectively reachable only via subdomain rewrites.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  children: React.ReactNode;
  params: { agencySlug: string };
};

export default async function AgencyLayout({ children, params }: Props) {
  const { agencySlug } = params;

  const { data: agency, error } = await supabase
    .from("agencies")
    .select(
      "agency_id, slug, name, logo_url, primary_color, secondary_color, font_family, status"
    )
    .eq("slug", agencySlug)
    .maybeSingle();

  if (error) {
    // Don't leak details; treat as not-found so customers and agencies see
    // a clean 404 rather than a stack trace.
    console.error("Agency lookup failed for", agencySlug, error);
    notFound();
  }

  if (!agency || agency.status !== "active") {
    notFound();
  }

  const branding = brandingFromRow(agency, agencySlug);

  return (
    <AgencyBrandingProvider branding={branding}>
      {children}
    </AgencyBrandingProvider>
  );
}
