import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { authorizeAgency } from "@/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { clientId: string } };

// GET /api/clients/{clientId}/qr — returns a PNG of the review URL QR.
// Useful for printing pipelines or when the dashboard wants a server-
// rendered version (e.g. embedded in an email).
//
// The dashboard's client detail page renders QR client-side via
// qrcode.react for instant feedback; this endpoint is the canonical
// server-side counterpart.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await authorizeAgency();
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("slug, business_name")
    .eq("client_id", params.clientId)
    .eq("agency_id", ctx.agencyId)
    .maybeSingle();
  if (!client) return new Response("Not found", { status: 404 });

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";
  const url = `https://${ctx.agencySlug}.${baseDomain}/r/${client.slug}`;

  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      width: 1024,
      color: { dark: "#1c1917", light: "#ffffff" },
    });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `inline; filename="${slugifyForFilename(
          client.business_name as string
        )}-qr.png"`,
      },
    });
  } catch (err) {
    console.error("qr render failed", err);
    return NextResponse.json(
      { error: "Could not generate QR." },
      { status: 500 }
    );
  }
}

function slugifyForFilename(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "qr"
  );
}
