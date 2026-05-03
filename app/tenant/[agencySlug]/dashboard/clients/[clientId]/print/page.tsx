import { notFound } from "next/navigation";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import PrintQR from "./PrintQR";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string; clientId: string };

export default async function PrintQRPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, slug")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();

  if (!client) notFound();

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";
  const reviewUrl = `https://${ctx.agencySlug}.${baseDomain}/r/${client.slug}`;

  return (
    <PrintQR
      businessName={client.business_name as string}
      reviewUrl={reviewUrl}
      agencyName={ctx.agencyName}
    />
  );
}
