import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { clientId: string } };

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if the value contains a comma, quote, or newline
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  // Verify the client belongs to this agency (no data leakage across tenants)
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("client_id, business_name, slug")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select("created_at, star_rating, cleaned_review, raw_transcript, char_count")
    .eq("client_id", params.clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("export reviews fetch failed:", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  const rows = reviews ?? [];

  // Build CSV
  const header = ["Date", "Time (UTC)", "Stars", "Review", "Raw Transcript", "Characters"].join(",");

  const lines = rows.map((r) => {
    const dt = new Date(r.created_at as string);
    const date = dt.toISOString().slice(0, 10);
    const time = dt.toISOString().slice(11, 19);
    const stars = r.star_rating != null ? String(r.star_rating) : "";
    return [
      csvCell(date),
      csvCell(time),
      csvCell(stars),
      csvCell(r.cleaned_review as string),
      csvCell(r.raw_transcript as string),
      csvCell(r.char_count as number),
    ].join(",");
  });

  const csv = [header, ...lines].join("\r\n");

  const filename = `${client.slug as string}-reviews-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
