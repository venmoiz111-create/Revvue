import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { clientId: string } };

// All three methods (GET, PATCH, DELETE) are scoped to the caller's
// agency. A client_id that belongs to a different agency 404s (does not
// 403) so we don't leak existence across tenants.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select(
      "client_id, business_name, slug, google_review_link, owner_email, owner_phone, status, created_at"
    )
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();

  if (error) {
    console.error("client GET failed", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ client: data });
}

type PatchBody = {
  business_name?: unknown;
  google_review_link?: unknown;
  owner_email?: unknown;
  owner_phone?: unknown;
  status?: unknown;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Ensure client belongs to caller's agency before mutating.
  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("client_id")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();
  if (!existing)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updates: Record<string, unknown> = {};

  if (body.business_name !== undefined) {
    const v = asString(body.business_name).trim();
    if (!v)
      return NextResponse.json(
        { error: "Business name cannot be empty." },
        { status: 400 }
      );
    updates.business_name = v;
  }

  if (body.google_review_link !== undefined) {
    const v = asString(body.google_review_link).trim();
    try {
      const u = new URL(v);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        throw new Error("bad protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Google review link must be a full URL." },
        { status: 400 }
      );
    }
    updates.google_review_link = v;
  }

  if (body.owner_email !== undefined) {
    updates.owner_email = asString(body.owner_email).trim() || null;
  }
  if (body.owner_phone !== undefined) {
    updates.owner_phone = asString(body.owner_phone).trim() || null;
  }
  if (body.status !== undefined) {
    const v = asString(body.status).trim();
    if (!["active", "paused", "archived"].includes(v)) {
      return NextResponse.json(
        { error: "Status must be active, paused, or archived." },
        { status: 400 }
      );
    }
    updates.status = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("clients")
    .update(updates)
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId);

  if (updateErr) {
    console.error("client PATCH failed", updateErr);
    return NextResponse.json({ error: "Could not update." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  // Confirm scope before deleting so a stale client_id doesn't 200 with
  // 0 rows affected silently.
  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("client_id")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();
  if (!existing)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { error: deleteErr } = await supabaseAdmin
    .from("clients")
    .delete()
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId);

  if (deleteErr) {
    console.error("client DELETE failed", deleteErr);
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
