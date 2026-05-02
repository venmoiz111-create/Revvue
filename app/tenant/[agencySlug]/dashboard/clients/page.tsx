import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const FOUNDER_EMAIL =
  process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live";

export default async function ClientsListPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  // Fetch the agency's clients with derived review counts and last-review
  // timestamps. Two queries: the simple list, then a grouped count we
  // join in JS. (A SQL view would be nicer but we don't want to add one
  // mid-build.)
  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, slug, created_at, status")
    .eq("agency_id", ctx.agencyId)
    .order("created_at", { ascending: false });

  const ids = (clients ?? []).map((c) => c.client_id as string);

  const reviewsByClient = new Map<
    string,
    { count: number; latest: string | null }
  >();

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
          <h1 className="font-serif text-3xl tracking-tight text-stone-900">
            Restaurants
          </h1>
          <p className="mt-2 text-stone-600">
            {clients?.length ?? 0} of{" "}
            {ctx.maxClients >= 99999 ? "unlimited" : ctx.maxClients} on your
            plan.
          </p>
        </div>
        {atLimit ? (
          <a
            href={`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(
              "Upgrade Revvue plan"
            )}`}
            className="rounded-full bg-amber-100 text-amber-900 font-medium px-5 py-2.5 text-sm border border-amber-200 hover:bg-amber-200 transition-colors"
          >
            At plan limit — email Ven to upgrade
          </a>
        ) : (
          <Link
            href="/dashboard/clients/new"
            className="rounded-full bg-stone-900 text-stone-50 font-medium px-5 py-2.5 text-sm hover:bg-stone-800 transition-colors"
          >
            + Add restaurant
          </Link>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {(clients?.length ?? 0) === 0 ? (
          <div className="p-10 text-center">
            <p className="text-stone-600">No restaurants yet.</p>
            <Link
              href="/dashboard/clients/new"
              className="mt-4 inline-flex rounded-full bg-stone-900 text-stone-50 px-5 py-2.5 text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Add your first restaurant
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[11px] tracking-widest">
              <tr>
                <th className="text-left py-3 px-5">Business</th>
                <th className="text-left py-3 px-5">Slug</th>
                <th className="text-right py-3 px-5">Reviews</th>
                <th className="text-left py-3 px-5">Last review</th>
                <th className="text-right py-3 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(clients ?? []).map((c) => {
                const stats = reviewsByClient.get(c.client_id as string);
                return (
                  <tr key={c.client_id as string} className="hover:bg-stone-50">
                    <td className="py-3 px-5 text-stone-900 font-medium">
                      {c.business_name}
                    </td>
                    <td className="py-3 px-5 text-stone-600 font-mono text-xs">
                      <a
                        href={`/r/${c.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-stone-900"
                      >
                        /r/{c.slug as string}
                      </a>
                    </td>
                    <td className="py-3 px-5 text-stone-700 text-right tabular-nums">
                      {stats?.count ?? 0}
                    </td>
                    <td className="py-3 px-5 text-stone-500 text-xs">
                      {stats?.latest
                        ? new Date(stats.latest).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/dashboard/clients/${c.client_id as string}`}
                        className="text-stone-700 hover:text-stone-900 underline underline-offset-4 text-xs"
                      >
                        Open
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
