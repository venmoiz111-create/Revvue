import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getPlan } from "@/lib/plans";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL =
  process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live";

export default async function SettingsPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("contact_name, contact_email, contact_phone, plan, max_clients, paid_until, trial_ends_at")
    .eq("agency_id", ctx.agencyId)
    .single();

  const planMeta = getPlan(agency?.plan as string | null);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-stone-900">
          Settings
        </h1>
        <p className="mt-2 text-stone-600">
          Update how we reach you. Plan changes happen via email.
        </p>
      </div>

      <SettingsForm
        initial={{
          contact_name: (agency?.contact_name as string | null) ?? "",
          contact_email:
            (agency?.contact_email as string | null) ?? ctx.email,
          contact_phone: (agency?.contact_phone as string | null) ?? "",
        }}
      />

      <section className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6">
        <h2 className="font-serif text-xl tracking-tight text-stone-900">
          Plan
        </h2>
        <dl className="mt-4 space-y-2 text-sm text-stone-700">
          <Row label="Current plan">
            <span className="capitalize">{agency?.plan ?? "trial"}</span>
            {planMeta ? (
              <span className="text-stone-500">
                {" "}
                — {planMeta.priceLabel}/mo
              </span>
            ) : null}
          </Row>
          <Row label="Restaurant limit">
            {ctx.maxClients >= 99999 ? "Unlimited" : ctx.maxClients}
          </Row>
          {agency?.trial_ends_at ? (
            <Row label="Trial ends">
              {new Date(agency.trial_ends_at as string).toLocaleString()}
            </Row>
          ) : null}
          {agency?.paid_until ? (
            <Row label="Paid until">
              {new Date(agency.paid_until as string).toLocaleString()}
            </Row>
          ) : null}
        </dl>
        <a
          href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(
            `Change Revvue plan for ${ctx.agencyName}`
          )}`}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-5 py-2.5 text-sm hover:bg-stone-800 transition-colors"
        >
          Email Ven to change plan
        </a>
        <p className="mt-3 text-xs text-stone-500">
          Billing is currently handled by hand — PayPal, Interac, or Stripe
          invoice. Reply to your welcome email or write to{" "}
          <a
            href={`mailto:${FOUNDER_EMAIL}`}
            className="underline underline-offset-4"
          >
            {FOUNDER_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-stone-800">{children}</dd>
    </div>
  );
}
