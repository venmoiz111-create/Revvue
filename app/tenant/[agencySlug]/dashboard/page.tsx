import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import WeeklyChart, { type DayCount } from "@/components/WeeklyChart";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DashboardOverview({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: totalClients }, { count: totalReviews }, { count: weekReviews }, recent, trend] =
    await Promise.all([
      supabaseAdmin.from("clients").select("client_id", { count: "exact", head: true }).eq("agency_id", ctx.agencyId),
      supabaseAdmin.from("reviews").select("review_id, client_id, clients!inner(agency_id)", { count: "exact", head: true }).eq("clients.agency_id", ctx.agencyId),
      supabaseAdmin.from("reviews").select("review_id, client_id, clients!inner(agency_id)", { count: "exact", head: true }).eq("clients.agency_id", ctx.agencyId).gte("created_at", sevenDaysAgo),
      supabaseAdmin.from("reviews").select("review_id, cleaned_review, char_count, star_rating, created_at, clients!inner(agency_id, business_name, slug)").eq("clients.agency_id", ctx.agencyId).order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("reviews").select("created_at, star_rating, clients!inner(agency_id)").eq("clients.agency_id", ctx.agencyId).gte("created_at", sevenDaysAgo),
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {ctx.agencyName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Here is how your businesses are doing this week.
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="rounded-full bg-green-500 text-black font-bold px-5 py-2.5 text-sm hover:bg-green-400 transition-colors"
        >
          + Add business
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Businesses" value={totalClients ?? 0} />
        <Stat label="This week" value={weekReviews ?? 0} />
        <Stat label="All-time reviews" value={totalReviews ?? 0} />
        <Stat
          label="Plan"
          value={ctx.plan.charAt(0).toUpperCase() + ctx.plan.slice(1)}
          hint={
            ctx.plan === "trial" && ctx.trialEndsAt
              ? `Trial ends ${new Date(ctx.trialEndsAt).toLocaleDateString()}`
              : ctx.paidUntil
                ? `Paid until ${new Date(ctx.paidUntil).toLocaleDateString()}`
                : undefined
          }
        />
      </div>

      <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
        <WeeklyChart days={days} avgStarRating={avgStarRating} />
      </section>

      <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Recent reviews</h2>
          <Link
            href="/dashboard/clients"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            View clients →
          </Link>
        </div>
        {recentRows.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-zinc-600 text-sm">No reviews yet.</p>
            <p className="mt-1 text-xs text-zinc-700">Add a business and share the QR code with your customers.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/60">
            {recentRows.map((r) => (
              <li key={r.review_id} className="py-4">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span className="font-medium text-zinc-400">{r.clients?.business_name ?? "Unknown"}</span>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                </div>
                {r.star_rating != null && (
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="text-sm leading-none"
                        style={{ color: s <= r.star_rating! ? "#22c55e" : "#27272a" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-zinc-300 text-sm leading-relaxed">{r.cleaned_review}</p>
                <div className="mt-1 text-xs text-zinc-700">{r.char_count} chars</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-zinc-600 font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-black text-white tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-600">{hint}</div> : null}
    </div>
  );
}
