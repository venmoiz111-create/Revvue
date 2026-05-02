import { notFound } from "next/navigation";
import Link from "next/link";
import { loadDashboardContext } from "@/lib/dashboardContext";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import DeleteClientButton from "./DeleteClientButton";

export const dynamic = "force-dynamic";

type Params = { agencySlug: string; clientId: string };

export default async function ClientDetailPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await loadDashboardContext(params.agencySlug);

  // Lookup the client AND scope to this agency. Wrong-tenant client_id
  // 404s rather than leaking existence.
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select(
      "client_id, business_name, slug, google_review_link, owner_email, owner_phone, status, created_at"
    )
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();

  if (!client) notFound();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: week }, { count: month }, recent] =
    await Promise.all([
      supabaseAdmin
        .from("reviews")
        .select("review_id", { count: "exact", head: true })
        .eq("client_id", client.client_id as string),
      supabaseAdmin
        .from("reviews")
        .select("review_id", { count: "exact", head: true })
        .eq("client_id", client.client_id as string)
        .gte("created_at", sevenDaysAgo),
      supabaseAdmin
        .from("reviews")
        .select("review_id", { count: "exact", head: true })
        .eq("client_id", client.client_id as string)
        .gte("created_at", thirtyDaysAgo),
      supabaseAdmin
        .from("reviews")
        .select(
          "review_id, raw_transcript, cleaned_review, char_count, star_rating, created_at"
        )
        .eq("client_id", client.client_id as string)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";
  // We use https for the embedded QR URL so a printed QR scanned in the
  // wild always lands on the production domain. Even in dev, the QR
  // points at the agency's prod subdomain — that's what you'd want when
  // printing from a real account.
  const reviewUrl = `https://${ctx.agencySlug}.${baseDomain}/r/${client.slug}`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          ← Back to clients
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-stone-900">
              {client.business_name}
            </h1>
            <p className="mt-1 text-stone-500 font-mono text-sm">
              /r/{client.slug as string}
            </p>
          </div>
          <DeleteClientButton clientId={client.client_id as string} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl tracking-tight text-stone-900 mb-4">
            QR code
          </h2>
          <QRCodeDisplay url={reviewUrl} businessName={client.business_name as string} />
        </section>

        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-xl tracking-tight text-stone-900 mb-4">
            Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="All-time" value={total ?? 0} />
            <Stat label="Last 30 days" value={month ?? 0} />
            <Stat label="Last 7 days" value={week ?? 0} />
          </div>
          <h3 className="mt-6 font-medium text-stone-900">Details</h3>
          <dl className="mt-2 text-sm space-y-1.5 text-stone-700">
            <Row label="Google review link">
              <a
                href={client.google_review_link as string}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-stone-900 break-all"
              >
                {client.google_review_link as string}
              </a>
            </Row>
            <Row label="Owner email">
              {(client.owner_email as string | null) ?? "—"}
            </Row>
            <Row label="Owner phone">
              {(client.owner_phone as string | null) ?? "—"}
            </Row>
            <Row label="Created">
              {new Date(client.created_at as string).toLocaleString()}
            </Row>
          </dl>
        </section>
      </div>

      <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif text-xl tracking-tight text-stone-900">
          Recent reviews
        </h2>
        {(recent.data?.length ?? 0) === 0 ? (
          <p className="mt-4 text-stone-500 text-sm">
            No reviews yet. Print the QR code and put it on the table.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100">
            {(recent.data ?? []).map((r) => (
              <li key={r.review_id as string} className="py-4">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{new Date(r.created_at as string).toLocaleString()}</span>
                  <span>{r.char_count as number} chars</span>
                </div>
                {(r.star_rating as number | null) != null && (
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="text-sm leading-none"
                        style={{ color: s <= (r.star_rating as number) ? "#f59e0b" : "#d6d3d1" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-stone-800 leading-relaxed">
                  {r.cleaned_review as string}
                </p>
                {(r.raw_transcript as string) !==
                (r.cleaned_review as string) ? (
                  <details className="mt-1 text-xs text-stone-500">
                    <summary className="cursor-pointer">
                      Raw transcript
                    </summary>
                    <p className="mt-1 italic">
                      {r.raw_transcript as string}
                    </p>
                  </details>
                ) : null}
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
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
      <div className="text-[10px] uppercase tracking-widest text-stone-500">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl text-stone-900">{value}</div>
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
      <dd className="text-stone-800 text-right max-w-[60%]">{children}</dd>
    </div>
  );
}
