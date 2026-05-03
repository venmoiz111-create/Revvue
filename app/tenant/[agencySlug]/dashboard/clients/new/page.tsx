import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL =
  process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live";

export default async function NewClientPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  // We don't enforce the limit here — the API does that as the source of
  // truth — but we do show a friendly callout if they're already at cap.
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          ← Back to clients
        </Link>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-stone-900">
          Add a business
        </h1>
        <p className="mt-2 text-stone-600">
          We&apos;ll generate a QR code and a review URL on{" "}
          <code className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">
            {ctx.agencySlug}.revvue.live
          </code>
          .
        </p>
      </div>

      <NewClientForm
        agencySlug={ctx.agencySlug}
        founderEmail={FOUNDER_EMAIL}
      />
    </div>
  );
}
