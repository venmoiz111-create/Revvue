import { NextResponse, type NextRequest } from "next/server";

// White-label subdomain router.
//
// Routing model:
//   revvue.live              -> apex marketing + legacy /r/[slug]
//   www.revvue.live          -> apex (treated as no subdomain)
//   foo.revvue.live/path     -> internally rewritten to /tenant/foo/path
//   *.lvh.me / *.localhost   -> same behavior in local dev
//
// We deliberately do NOT rewrite:
//   - /_next/*   (build assets)
//   - /api/*     (API routes are global, not per-tenant in URL space)
//   - /tenant/*  (already a rewrite target — never reached from the apex
//                  except via abuse, which we 404 below)
//   - static asset paths (.png, .css, etc.)
//
// Tenant scoping for API routes is enforced at the API handler level using
// the authenticated user's agency_id, not via URL routing.
//
// Note on the /tenant prefix: Next.js App Router excludes underscore-
// prefixed folders (e.g. _agency) from the route table, so we use a
// regular folder name and explicitly block direct apex access below to
// preserve the "internal-only" semantic.

function getBaseDomain() {
  return (process.env.NEXT_PUBLIC_BASE_DOMAIN || "revvue.live").toLowerCase();
}

function extractSubdomain(hostname: string): string | null {
  const host = hostname.toLowerCase().split(":")[0]; // strip port
  const baseDomain = getBaseDomain();

  // Local dev: lvh.me resolves *.lvh.me -> 127.0.0.1
  // We treat anything like foo.lvh.me as subdomain "foo".
  if (host === "localhost" || host === "127.0.0.1") return null;
  if (host === "lvh.me") return null;

  if (host.endsWith(".lvh.me")) {
    const sub = host.slice(0, -".lvh.me".length);
    return sub && sub !== "www" ? sub : null;
  }

  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : null;
  }

  // Production: apex is exactly baseDomain (or www.baseDomain)
  if (host === baseDomain) return null;
  if (host === `www.${baseDomain}`) return null;

  if (host.endsWith(`.${baseDomain}`)) {
    const sub = host.slice(0, -`.${baseDomain}`.length);
    // Defensive: ignore double-dotted weirdness like a.b.revvue.live
    if (!sub || sub.includes(".")) return null;
    return sub === "www" ? null : sub;
  }

  // Unknown host (preview deploys, custom domains we haven't wired yet).
  // Fall through as no subdomain so the apex experience is shown.
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Hard-pass: build assets and API. The matcher already excludes most of
  // these, but this is a belt-and-suspenders guard so we never accidentally
  // tenant-scope an API route or _next asset.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(?:ico|png|jpe?g|svg|css|js|webp|gif|map|txt|xml|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get("host") || "";
  const subdomain = extractSubdomain(hostname);

  // Apex-direct-access guard: /tenant/* is a rewrite target, not a
  // user-facing URL. Anyone hitting it directly on the apex domain gets
  // a 404 so the internal route shape never leaks.
  if (!subdomain && pathname.startsWith("/tenant")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (subdomain) {
    // If the subdomain request is already at /tenant/* (e.g. from a
    // misbehaving client constructing the URL), let it through unchanged
    // rather than wrapping it again in /tenant/{slug}/tenant/...
    if (pathname.startsWith("/tenant")) {
      return NextResponse.next();
    }
    url.pathname = `/tenant/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and the favicon; finer-grained
  // pass-through is handled inside the middleware itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
