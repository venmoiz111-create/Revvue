import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import WeeklyChart, { type DayCount } from "@/components/WeeklyChart";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DashboardOverview({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalClients }, { count: totalReviews }, { count: weekReviews }, recent, trend] =
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
      supabaseAdmin
        .from("reviews")
        .select("created_at, star_rating, clients!inner(agency_id)")
        .eq("clients.agency_id", ctx.agencyId)
        .gte("created_at", sevenDaysAgo),
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

  // Build the 7-day buckets
  const trendRows = (trend.data ?? []) as { created_at: string; star_rating: number | null }[];

  const days: DayCount[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = i === 6 ? "Today" : DAY_LABELS[d.getDay()];
    return { date: dateStr, label, count: 0 };
  });

  for (const row of trendRows) {
    const dateStr = row.created_at.slice(0, 10);
    const bucket = days.find((d) => d.date === dateStr);
    if (bucket) bucket.count += 1;
  }

  const ratedRows = trendRows.filter((r) => r.star_rating != null);
  const avgStarRating =
    ratedRows.length > 0
      ? ratedRows.reduce((sum, r) => sum + (r.star_rating as number), 0) / ratedRows.length
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-stone-900">
            Welcome back, {ctx.agencyName}
          </h1>
          <p className="mt-2 text-stone-600">
            Here&apos;s how your businesses are doing this week.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="rounded-full bg-stone-900 text-stone-50 font-medium px-5 py-2.5 text-sm hover:bg-stone-800 transition-colors"
        >
          + Add business
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Businesses" value={totalClients ?? 0} />
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
        <WeeklyChart days={days} avgStarRating={avgStarRating} />
      </section>

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
            No reviews yet. Add a business and share the QR code with your customers.
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
