import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL = process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com";

export default async function SettingsPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("contact_name, contact_email, contact_phone, plan, max_clients, paid_until, trial_ends_at")
    .eq("agency_id", ctx.agencyId)
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update how we reach you. Plan changes happen via email.
        </p>
      </div>

      <SettingsForm
        initial={{
          contact_name: (agency?.contact_name as string | null) ?? "",
          contact_email: (agency?.contact_email as string | null) ?? ctx.email,
          contact_phone: (agency?.contact_phone as string | null) ?? "",
        }}
      />

      <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
        <h2 className="font-bold text-white text-lg">Plan</h2>
        <dl className="mt-4 space-y-2 text-sm divide-y divide-zinc-800/50">
          <Row label="Current plan">
            <span className="capitalize text-white font-semibold">{agency?.plan ?? "trial"}</span>
          </Row>
          <Row label="Restaurant limit">
            <span className="text-white">{ctx.maxClients >= 99999 ? "Unlimited" : ctx.maxClients}</span>
          </Row>
          {agency?.trial_ends_at && (
            <Row label="Trial ends">
              <span className="text-white">{new Date(agency.trial_ends_at as string).toLocaleDateString()}</span>
            </Row>
          )}
          {agency?.paid_until && (
            <Row label="Paid until">
              <span className="text-white">{new Date(agency.paid_until as string).toLocaleDateString()}</span>
            </Row>
          )}
        </dl>
        <a
          href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(`Change Revvue plan for ${ctx.agencyName}`)}`}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-5 py-2.5 text-sm hover:bg-green-400 transition-colors"
        >
          Email to change plan
        </a>
        <p className="mt-3 text-xs text-zinc-600">
          Billing is handled by email. Write to{" "}
          <a href={`mailto:${FOUNDER_EMAIL}`} className="text-zinc-400 underline underline-offset-4 hover:text-white">
            {FOUNDER_EMAIL}
          </a>
        </p>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
