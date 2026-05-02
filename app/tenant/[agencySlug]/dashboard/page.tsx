import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

export default async function DashboardOverview({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  // Aggregate stats. We do this with the admin client because the user
  // session is auth-confirmed and the layout has already verified the
  // user belongs to this agency. Doing aggregates via RLS-scoped reads
  // would also work but requires more roundtrips.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalClients }, { count: totalReviews }, { count: weekReviews }, recent] =
    await Promise.all([
      supabaseAdmin
        .from("clients")
        .select("client_id", { count: "exact", head: true })
        .eq("agency_id", ctx.agencyId),
      supabaseAdmin
        .from("reviews")
        .select("review_id, client_id, clients!inner(agency_id)", {
          count: "exact",
          head: true,
        })
        .eq("clients.agency_id", ctx.agencyId),
      supabaseAdmin
        .from("reviews")
        .select("review_id, client_id, clients!inner(agency_id)", {
          count: "exact",
          head: true,
        })
        .eq("clients.agency_id", ctx.agencyId)
        .gte("created_at", sevenDaysAgo),
      supabaseAdmin
        .from("reviews")
        .select(
          "review_id, cleaned_review, char_count, star_rating, created_at, clients!inner(agency_id, business_name, slug)"
        )
        .eq("clients.agency_id", ctx.agencyId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  type RecentReview = {
    review_id: string;
    cleaned_review: string;
    char_count: number;
    star_rating: number | null;
    created_at: string;
    clients: { agency_id: string; business_name: string; slug: string } | null;
  };

  const recentRows = (recent.data ?? []) as unknown as RecentReview[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-stone-900">
            Welcome back, {ctx.agencyName}
          </h1>
          <p className="mt-2 text-stone-600">
            Here&apos;s how your restaurants are doing this week.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="rounded-full bg-stone-900 text-stone-50 font-medium px-5 py-2.5 text-sm hover:bg-stone-800 transition-colors"
        >
          + Add restaurant
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Restaurants" value={totalClients ?? 0} />
        <Stat label="Reviews this week" value={weekReviews ?? 0} />
        <Stat label="Reviews all-time" value={totalReviews ?? 0} />
        <Stat
          label="Plan"
          value={ctx.plan.charAt(0).toUpperCase() + ctx.plan.slice(1)}
          hint={
            ctx.plan === "trial" && ctx.trialEndsAt
              ? `Trial: ${new Date(ctx.trialEndsAt).toLocaleDateString()}`
              : ctx.paidUntil
                ? `Paid until ${new Date(ctx.paidUntil).toLocaleDateString()}`
                : undefined
          }
        />
      </div>

      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-xl tracking-tight text-stone-900">
            Recent reviews
          </h2>
          <Link
            href="/dashboard/clients"
            className="text-sm text-stone-600 hover:text-stone-900 underline underline-offset-4"
          >
            View clients
          </Link>
        </div>
        {recentRows.length === 0 ? (
          <p className="mt-6 text-stone-500 text-sm">
            No reviews yet. Add a restaurant and put the QR code on the table.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100">
            {recentRows.map((r) => (
              <li key={r.review_id} className="py-4">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{r.clients?.business_name ?? "—"}</span>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                </div>
                {r.star_rating != null && (
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="text-sm leading-none"
                        style={{ color: s <= r.star_rating! ? "#f59e0b" : "#d6d3d1" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-stone-800 leading-relaxed">
                  {r.cleaned_review}
                </p>
                <div className="mt-1 text-xs text-stone-400">
                  {r.char_count} chars
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
      <div className="text-xs uppercase tracking-widest text-stone-500">
        {label}
      </div>
      <div className="mt-2 font-serif text-3xl text-stone-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-stone-500">{hint}</div> : null}
    </div>
  );
}
