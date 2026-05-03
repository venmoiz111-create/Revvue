"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";
import { useAgencyBranding } from "@/components/AgencyBrandingProvider";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/branding", label: "Branding" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const branding = useAgencyBranding();

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-zinc-950 border-r border-zinc-800 min-h-screen sticky top-0">
      <div className="p-5 border-b border-zinc-800">
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={branding.agencyName}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <p
            className="text-base font-black text-white tracking-tight"
            style={{ fontFamily: branding.fontFamily }}
          >
            {branding.agencyName}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-600 font-mono">
          {branding.agencySlug}.revvue.live
        </p>
      </div>

      <nav className="p-3 flex-1 space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-green-500 text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
