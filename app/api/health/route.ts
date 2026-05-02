import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight health endpoint. Used by uptime monitors / Vercel cron pings
// / cold-boot warmup. Intentionally does NOT touch Supabase or Anthropic
// so it stays cheap and won't false-alert on third-party outages.
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "revvue",
    ts: new Date().toISOString(),
  });
}
