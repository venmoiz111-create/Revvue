import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import NewClientForm from "./NewClientForm";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL = process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com";

export default async function NewClientPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Back to clients
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
          Add a business
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          We will generate a QR code and a review URL on{" "}
          <code className="font-mono text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
            {ctx.agencySlug}.revvue.live
          </code>
        </p>
      </div>

      <NewClientForm agencySlug={ctx.agencySlug} founderEmail={FOUNDER_EMAIL} />
    </div>
  );
}
