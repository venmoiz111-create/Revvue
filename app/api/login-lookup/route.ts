import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/login-lookup
// Takes { email } and returns { slug } — the agency subdomain for that email.
// Used by the apex /login page to redirect the user to their portal's login.
export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Look up the agency by the contact email they signed up with.
  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("slug")
    .eq("contact_email", email)
    .maybeSingle();

  if (!agency?.slug) {
    // Return a generic message — don't confirm whether the email exists.
    return NextResponse.json(
      { error: "No account found for that email. Check for typos or sign up." },
      { status: 404 }
    );
  }

  return NextResponse.json({ slug: agency.slug });
}
