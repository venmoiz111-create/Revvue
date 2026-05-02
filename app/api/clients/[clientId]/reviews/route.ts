import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { clientId: string } };

// GET /api/clients/{clientId}/reviews?limit=50&offset=0
// Lists reviews for a client. Strictly scoped to the calling agency.
export async function GET(req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  // Verify the client belongs to the caller's agency before returning
  // any rows. Without this, a malicious caller could enumerate other
  // tenants' review activity by guessing client_ids.
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("client_id")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();
  if (!client) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(req.url);
  const limitRaw = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offsetRaw = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 50, 1), 200);
  const offset = Math.max(Number.isFinite(offsetRaw) ? offsetRaw : 0, 0);

  const { data, count, error } = await supabaseAdmin
    .from("reviews")
    .select(
      "review_id, raw_transcript, cleaned_review, char_count, processing_ms, created_at",
      { count: "exact" }
    )
    .eq("client_id", params.clientId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("reviews list failed", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  return NextResponse.json({
    reviews: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  });
}
