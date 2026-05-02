import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/agencies/me — return the current user's agency. Used by the
// dashboard to refresh state without a full page reload.
export async function GET() {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  const { data, error } = await supabaseAdmin
    .from("agencies")
    .select(
      "agency_id, slug, name, logo_url, primary_color, secondary_color, font_family, contact_name, contact_email, contact_phone, plan, trial_ends_at, paid_until, max_clients, status, created_at"
    )
    .eq("agency_id", ctx.agencyId)
    .single();

  if (error || !data) {
    console.error("agencies/me GET failed", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
  return NextResponse.json({ agency: data });
}

// PATCH /api/agencies/me — update branding/contact for the caller's agency.
// Plan, max_clients, status, trial_ends_at, paid_until are NEVER editable
// here — those are founder-only and updated via SQL when payment lands.
type PatchBody = {
  name?: unknown;
  logo_url?: unknown;
  primary_color?: unknown;
  secondary_color?: unknown;
  font_family?: unknown;
  contact_name?: unknown;
  contact_email?: unknown;
  contact_phone?: unknown;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const v = asString(body.name).trim();
    if (!v) {
      return NextResponse.json(
        { error: "Agency name cannot be empty." },
        { status: 400 }
      );
    }
    updates.name = v;
  }

  if (body.logo_url !== undefined) {
    const v = asString(body.logo_url).trim();
    if (v) {
      try {
        const u = new URL(v);
        if (u.protocol !== "https:" && u.protocol !== "http:") {
          throw new Error("bad protocol");
        }
      } catch {
        return NextResponse.json(
          { error: "Logo URL must be a full URL." },
          { status: 400 }
        );
      }
    }
    updates.logo_url = v || null;
  }

  if (body.primary_color !== undefined) {
    const v = asString(body.primary_color).trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
      return NextResponse.json(
        { error: "Primary color must be a 6-digit hex like #1c1917." },
        { status: 400 }
      );
    }
    updates.primary_color = v;
  }

  if (body.secondary_color !== undefined) {
    const v = asString(body.secondary_color).trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
      return NextResponse.json(
        { error: "Secondary color must be a 6-digit hex." },
        { status: 400 }
      );
    }
    updates.secondary_color = v;
  }

  if (body.font_family !== undefined) {
    const v = asString(body.font_family).trim();
    if (!["serif", "sans-serif"].includes(v)) {
      return NextResponse.json(
        { error: "Font must be serif or sans-serif." },
        { status: 400 }
      );
    }
    updates.font_family = v;
  }

  if (body.contact_name !== undefined) {
    updates.contact_name = asString(body.contact_name).trim() || null;
  }

  if (body.contact_email !== undefined) {
    const v = asString(body.contact_email).trim();
    if (!v.includes("@")) {
      return NextResponse.json(
        { error: "Contact email must be an email address." },
        { status: 400 }
      );
    }
    updates.contact_email = v;
  }

  if (body.contact_phone !== undefined) {
    updates.contact_phone = asString(body.contact_phone).trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("agencies")
    .update(updates)
    .eq("agency_id", ctx.agencyId);

  if (error) {
    console.error("agencies/me PATCH failed", error);
    return NextResponse.json({ error: "Could not update." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
