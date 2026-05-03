import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reserved slugs — none of these can become an agency subdomain.
// Includes Next/Vercel/system reservations and our own apex routes.
const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "auth",
  "dashboard",
  "signup",
  "login",
  "signin",
  "agencies",
  "agency",
  "r",
  "revvue",
  "tenant",
  "static",
  "assets",
  "public",
  "blog",
  "docs",
  "help",
  "support",
  "status",
  "about",
  "pricing",
  "terms",
  "privacy",
]);

const SUBDOMAIN_RE = /^[a-z0-9-]{3,32}$/;

type CreateBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  slug?: unknown;
  primary_color?: unknown;
  font_family?: unknown;
  logo_url?: unknown;
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export async function POST(req: NextRequest) {
  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = asString(body.email).trim().toLowerCase();
  const password = asString(body.password);
  const name = asString(body.name).trim();
  const slug = asString(body.slug).trim().toLowerCase();
  const primary_color = asString(body.primary_color).trim() || "#1c1917";
  const font_family = asString(body.font_family).trim() || "serif";
  const logo_url = asString(body.logo_url).trim();

  // Validation
  if (!email || !password || !name || !slug) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "That email doesn't look right." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (!SUBDOMAIN_RE.test(slug)) {
    return NextResponse.json(
      { error: "Subdomain must be 3–32 lowercase letters, numbers, or hyphens." },
      { status: 400 }
    );
  }
  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json(
      { error: "That subdomain is reserved. Pick another." },
      { status: 400 }
    );
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(primary_color)) {
    return NextResponse.json(
      { error: "Primary color must be a 6-digit hex like #1c1917." },
      { status: 400 }
    );
  }
  if (!["serif", "sans-serif"].includes(font_family)) {
    return NextResponse.json(
      { error: "Font must be serif or sans-serif." },
      { status: 400 }
    );
  }

  // Pre-check slug to give a clean error before creating an auth user we
  // would have to clean up. Race-conditions are still handled by the
  // unique-constraint on agencies.slug below.
  {
    const { data: existing, error: lookupErr } = await supabaseAdmin
      .from("agencies")
      .select("agency_id")
      .eq("slug", slug)
      .maybeSingle();
    if (lookupErr) {
      console.error("slug pre-check failed", lookupErr);
      return NextResponse.json(
        { error: "Server error. Try again." },
        { status: 500 }
      );
    }
    if (existing) {
      return NextResponse.json(
        { error: "That subdomain is taken." },
        { status: 409 }
      );
    }
  }

  // 1) Create the auth user. We mark email as confirmed so they can log
  //    in immediately — the founder verifies legitimacy via the welcome
  //    email anyway.
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    // Common case: email already in use.
    if (
      authError?.message?.toLowerCase().includes("already") ||
      authError?.message?.toLowerCase().includes("registered")
    ) {
      return NextResponse.json(
        { error: "That email is already registered. Try signing in instead." },
        { status: 409 }
      );
    }
    console.error("createUser failed", authError);
    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 }
    );
  }

  const userId = authData.user.id;

  // 2) Create the agency row. If this fails we MUST clean up the auth
  //    user we just created — otherwise re-trying signup will hit "email
  //    already registered" forever.
  const { data: agency, error: agencyError } = await supabaseAdmin
    .from("agencies")
    .insert({
      slug,
      name,
      contact_email: email,
      primary_color,
      font_family,
      logo_url: logo_url || null,
    })
    .select("agency_id, slug")
    .single();

  if (agencyError || !agency) {
    console.error("agency insert failed", agencyError);
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (cleanupErr) {
      console.error("cleanup deleteUser also failed", cleanupErr);
    }
    if (agencyError?.code === "23505") {
      return NextResponse.json(
        { error: "That subdomain is taken." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Could not create agency." },
      { status: 500 }
    );
  }

  // 3) Link user → agency as admin. If THIS fails, the user has an auth
  //    account and an agency exists but no membership — they can't log
  //    in. Roll back both.
  const { error: linkError } = await supabaseAdmin.from("agency_users").insert({
    user_id: userId,
    agency_id: agency.agency_id,
    role: "admin",
  });

  if (linkError) {
    console.error("agency_users link failed", linkError);
    try {
      await supabaseAdmin
        .from("agencies")
        .delete()
        .eq("agency_id", agency.agency_id);
    } catch (e) {
      console.error("rollback agency delete failed", e);
    }
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (e) {
      console.error("rollback deleteUser failed", e);
    }
    return NextResponse.json(
      { error: "Could not link account to agency." },
      { status: 500 }
    );
  }

  // 4) Welcome email — best-effort, non-blocking. Failures NEVER fail signup.
  try {
    await sendWelcomeEmail({ to: email, agencyName: name, slug });
  } catch (err) {
    console.error("welcome email failed (non-fatal)", err);
  }

  const redirectUrl = buildRedirectUrl(req, agency.slug);
  return NextResponse.json({
    success: true,
    slug: agency.slug,
    redirectUrl,
  });
}

// Choose the right post-signup redirect URL for the environment:
//  - Local dev (host is localhost / lvh.me): http://{slug}.lvh.me:3000/dashboard
//    (lvh.me + any subdomain resolves to 127.0.0.1, so this always works.)
//  - Production: https://{slug}.{baseDomain}/dashboard
function buildRedirectUrl(req: NextRequest, slug: string): string {
  const host = (req.headers.get("host") || "").toLowerCase();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";

  const isLocal =
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "lvh.me" ||
    host.endsWith(".lvh.me") ||
    host.startsWith("lvh.me:") ||
    host.includes(".lvh.me:");

  if (isLocal) {
    const portMatch = host.match(/:(\d+)$/);
    const port = portMatch ? portMatch[1] : "3000";
    return `http://${slug}.lvh.me:${port}/dashboard`;
  }

  return `https://${slug}.${baseDomain}/dashboard`;
}

// Welcome email — stubbed unless RESEND_API_KEY is configured.
// Wrap network calls in try/catch at the call site so a failure here
// never blocks signup. We deliberately import resend lazily so the build
// doesn't require the package when it's not in use.
async function sendWelcomeEmail({
  to,
  agencyName,
  slug,
}: {
  to: string;
  agencyName: string;
  slug: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live";

  if (!apiKey) {
    console.log(
      `[welcome-email STUB] new agency: ${agencyName} (${slug}) — ${to}`
    );
    return;
  }

  // Lightweight, dependency-free Resend call via fetch. Avoids needing
  // to install `resend` until we actually want richer email features.
  const from = process.env.EMAIL_FROM || "Revvue <noreply@revvue.live>";
  const founderEmail =
    process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com";

  const subject = `Welcome to Revvue, ${agencyName}`;
  const html = `
    <p>Welcome aboard.</p>
    <p>Your agency portal is live at <a href="https://${slug}.${baseDomain}/dashboard">https://${slug}.${baseDomain}/dashboard</a>.</p>
    <p>You're on a 14-day free trial. When you're ready to switch on a paid plan, just reply to this email or write to <a href="mailto:${founderEmail}">${founderEmail}</a>.</p>
    <p>— Ven</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}`);
  }
}
