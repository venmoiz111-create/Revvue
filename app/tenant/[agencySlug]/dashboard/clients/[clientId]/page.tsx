import { notFound } from "next/navigation";
import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import DeleteClientButton from "./DeleteClientButton";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string; clientId: string };

export default async function ClientDetailPage({ params }: { params: Params }) {
  const ctx = await loadDashboardContext(params.agencySlug);

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, slug, google_review_link, owner_email, owner_phone, status, created_at")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();

  if (!client) notFound();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: week }, { count: month }, recent] = await Promise.all([
    supabaseAdmin.from("reviews").select("review_id", { count: "exact", head: true }).eq("client_id", client.client_id as string),
    supabaseAdmin.from("reviews").select("review_id", { count: "exact", head: true }).eq("client_id", client.client_id as string).gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("reviews").select("review_id", { count: "exact", head: true }).eq("client_id", client.client_id as string).gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("reviews").select("review_id, raw_transcript, cleaned_review, char_count, star_rating, created_at").eq("client_id", client.client_id as string).order("created_at", { ascending: false }).limit(20),
  ]);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";
  const reviewUrl = `https://${ctx.agencySlug}.${baseDomain}/r/${client.slug}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/clients" className="text-sm text-zinc-500 hover:text-white transition-colors">
          ← Back to clients
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {client.business_name as string}
            </h1>
            <p className="mt-1 text-zinc-600 font-mono text-sm">
              /r/{client.slug as string}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/dashboard/clients/${client.client_id as string}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-green-500 text-black font-bold px-4 py-2 text-sm hover:bg-green-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print QR
            </a>
            <a
              href={`/api/clients/${client.client_id as string}/export`}
              download
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 text-zinc-400 font-medium px-4 py-2 text-sm hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
            <DeleteClientButton clientId={client.client_id as string} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5">QR code</h2>
          <QRCodeDisplay url={reviewUrl} businessName={client.business_name as string} />
        </section>

        <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5">Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="All-time" value={total ?? 0} />
            <Stat label="Last 30 d" value={month ?? 0} />
            <Stat label="Last 7 d" value={week ?? 0} />
          </div>
          <h3 className="mt-6 text-sm font-semibold text-zinc-400 uppercase tracking-widest">Details</h3>
          <dl className="mt-3 text-sm space-y-0 divide-y divide-zinc-800/60">
            <Row label="Google review link">
              <a
                href={client.google_review_link as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-400 underline underline-offset-4 break-all"
              >
                Open link
              </a>
            </Row>
            <Row label="Owner email">
              {(client.owner_email as string | null) ?? "Not set"}
            </Row>
            <Row label="Owner phone">
              {(client.owner_phone as string | null) ?? "Not set"}
            </Row>
            <Row label="Added">
              {new Date(client.created_at as string).toLocaleDateString()}
            </Row>
          </dl>
        </section>
      </div>

      <section className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6">
        <h2 className="font-bold text-white mb-1">Recent reviews</h2>
        {(recent.data?.length ?? 0) === 0 ? (
          <div className="mt-4 py-8 text-center">
            <p className="text-zinc-600 text-sm">No reviews yet.</p>
            <p className="mt-1 text-xs text-zinc-700">Print the QR code above and put it on the table.</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-800/60">
            {(recent.data ?? []).map((r) => (
              <li key={r.review_id as string} className="py-4">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{new Date(r.created_at as string).toLocaleString()}</span>
                  <span>{r.char_count as number} chars</span>
                </div>
                {(r.star_rating as number | null) != null && (
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="text-sm leading-none"
                        style={{ color: s <= (r.star_rating as number) ? "#22c55e" : "#27272a" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-zinc-300 leading-relaxed text-sm">{r.cleaned_review as string}</p>
                {(r.raw_transcript as string) !== (r.cleaned_review as string) && (
                  <details className="mt-1 text-xs text-zinc-600">
                    <summary className="cursor-pointer hover:text-zinc-400">Raw transcript</summary>
                    <p className="mt-1 italic text-zinc-500">{r.raw_transcript as string}</p>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-black text-white tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-zinc-500 text-sm">{label}</dt>
      <dd className="text-zinc-300 text-sm text-right max-w-[60%]">{children}</dd>
    </div>
  );
}
