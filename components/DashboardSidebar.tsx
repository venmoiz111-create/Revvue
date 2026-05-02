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
    // Hard navigate so the server picks up the cleared cookie.
    window.location.href = "/login";
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 min-h-screen sticky top-0">
      <div className="p-6 border-b border-stone-200">
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={branding.agencyName}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <p
            className="text-base font-medium text-stone-900"
            style={{ fontFamily: branding.fontFamily }}
          >
            {branding.agencyName}
          </p>
        )}
        <p className="mt-1 text-xs text-stone-500">
          {branding.agencySlug}.revvue.live
        </p>
      </div>
      <nav className="p-4 flex-1 space-y-1">
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
                "block rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-stone-900 text-stone-50"
                  : "text-stone-700 hover:bg-stone-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-stone-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
