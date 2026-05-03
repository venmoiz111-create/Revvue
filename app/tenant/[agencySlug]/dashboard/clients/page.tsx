import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL = process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live";

export default async function ClientsListPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, slug, created_at, status")
    .eq("agency_id", ctx.agencyId)
    .order("created_at", { ascending: false });

  const ids = (clients ?? []).map((c) => c.client_id as string);
  const reviewsByClient = new Map<string, { count: number; latest: string | null }>();

  if (ids.length > 0) {
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("client_id, created_at")
      .in("client_id", ids);
    for (const r of reviews ?? []) {
      const cid = r.client_id as string;
      const existing = reviewsByClient.get(cid) ?? { count: 0, latest: null };
      existing.count += 1;
      const ts = r.created_at as string;
      if (!existing.latest || ts > existing.latest) existing.latest = ts;
      reviewsByClient.set(cid, existing);
    }
  }

  const atLimit =
    ctx.maxClients !== null &&
    ctx.maxClients !== undefined &&
    (clients?.length ?? 0) >= ctx.maxClients;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Businesses</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {clients?.length ?? 0} of{" "}
            {ctx.maxClients >= 99999 ? "unlimited" : ctx.maxClients} on your plan.
          </p>
        </div>
        {atLimit ? (
          <a
            href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent("Upgrade Revvue plan")}`}
            className="rounded-full bg-zinc-800 text-zinc-300 font-medium px-5 py-2.5 text-sm border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            At plan limit — email to upgrade
          </a>
        ) : (
          <Link
            href="/dashboard/clients/new"
            className="rounded-full bg-green-500 text-black font-bold px-5 py-2.5 text-sm hover:bg-green-400 transition-colors"
          >
            + Add business
          </Link>
        )}
      </div>

      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden">
        {(clients?.length ?? 0) === 0 ? (
          <div className="p-10 text-center">
            <p className="text-zinc-500 text-sm">No businesses yet.</p>
            <Link
              href="/dashboard/clients/new"
              className="mt-4 inline-flex rounded-full bg-green-500 text-black px-5 py-2.5 text-sm font-bold hover:bg-green-400 transition-colors"
            >
              Add your first business
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="text-left py-3 px-5 text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Business</th>
                <th className="text-left py-3 px-5 text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Review URL</th>
                <th className="text-right py-3 px-5 text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Reviews</th>
                <th className="text-left py-3 px-5 text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Last review</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(clients ?? []).map((c) => {
                const stats = reviewsByClient.get(c.client_id as string);
                return (
                  <tr key={c.client_id as string} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-5 text-white font-medium">{c.business_name}</td>
                    <td className="py-3 px-5">
                      <a
                        href={`/r/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-zinc-500 hover:text-green-500 transition-colors"
                      >
                        /r/{c.slug as string}
                      </a>
                    </td>
                    <td className="py-3 px-5 text-white text-right tabular-nums font-bold">
                      {stats?.count ?? 0}
                    </td>
                    <td className="py-3 px-5 text-zinc-600 text-xs">
                      {stats?.latest ? new Date(stats.latest).toLocaleString() : "None yet"}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/dashboard/clients/${c.client_id as string}`}
                        className="text-xs text-green-500 hover:text-green-400 font-medium transition-colors"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
