import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import BrandingForm from "./BrandingForm";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

export default async function BrandingPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("name, logo_url, primary_color, font_family")
    .eq("agency_id", ctx.agencyId)
    .single();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Branding</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Changes apply instantly to every review page on{" "}
          <code className="font-mono text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
            {ctx.agencySlug}.revvue.live
          </code>
        </p>
      </div>

      <BrandingForm
        initial={{
          name: (agency?.name as string) ?? ctx.agencyName,
          logo_url: (agency?.logo_url as string | null) ?? "",
          primary_color: (agency?.primary_color as string) ?? "#000000",
          font_family:
            ((agency?.font_family as string) ?? "sans-serif") === "sans-serif"
              ? "sans-serif"
              : "serif",
        }}
      />
    </div>
  );
}
