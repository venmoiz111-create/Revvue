import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9-]{2,64}$/;

// GET /api/clients — list the calling agency's clients.
export async function GET() {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select(
      "client_id, business_name, slug, google_review_link, owner_email, owner_phone, status, created_at"
    )
    .eq("agency_id", ctx.agencyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("clients list failed", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  return NextResponse.json({ clients: data ?? [] });
}

// POST /api/clients — create a new client under the calling agency.
// Enforces max_clients server-side.
type CreateBody = {
  business_name?: unknown;
  slug?: unknown;
  google_review_link?: unknown;
  owner_email?: unknown;
  owner_phone?: unknown;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(req: NextRequest) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const business_name = asString(body.business_name).trim();
  const slug = asString(body.slug).trim().toLowerCase();
  const google_review_link = asString(body.google_review_link).trim();
  const owner_email = asString(body.owner_email).trim() || null;
  const owner_phone = asString(body.owner_phone).trim() || null;

  if (!business_name || !slug || !google_review_link) {
    return NextResponse.json(
      { error: "Business name, slug, and Google review link are required." },
      { status: 400 }
    );
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be 2–64 lowercase letters, numbers, or hyphens." },
      { status: 400 }
    );
  }
  try {
    const u = new URL(google_review_link);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      throw new Error("bad protocol");
    }
  } catch {
    return NextResponse.json(
      { error: "Google review link must be a full URL." },
      { status: 400 }
    );
  }

  // Enforce plan limit.
  const { count, error: countErr } = await supabaseAdmin
    .from("clients")
    .select("client_id", { count: "exact", head: true })
    .eq("agency_id", ctx.agencyId);
  if (countErr) {
    console.error("clients count failed", countErr);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
  if ((count ?? 0) >= ctx.maxClients) {
    return NextResponse.json(
      {
        error: `You've reached your plan limit of ${ctx.maxClients} restaurants. Email Ven to upgrade.`,
      },
      { status: 403 }
    );
  }

  // Slug collision check WITHIN this agency. (Different agencies can have
  // the same slug — they live on different subdomains.)
  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("client_id")
    .eq("agency_id", ctx.agencyId)
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "A restaurant with that slug already exists in your account." },
      { status: 409 }
    );
  }

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("clients")
    .insert({
      agency_id: ctx.agencyId,
      business_name,
      slug,
      google_review_link,
      owner_email,
      owner_phone,
      status: "active",
    })
    .select("client_id")
    .single();

  if (insertErr || !inserted) {
    console.error("client insert failed", insertErr);
    // Most likely a UNIQUE collision against the global clients.slug index
    // (legacy single-tenant constraint). Surface a friendly message.
    if (insertErr?.code === "23505") {
      return NextResponse.json(
        {
          error:
            "That slug is already used elsewhere in the database. Try a more specific slug.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Could not create restaurant." },
      { status: 500 }
    );
  }

  return NextResponse.json({ client_id: inserted.client_id }, { status: 201 });
}
