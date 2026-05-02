"use client";

import { createContext, useContext, useMemo } from "react";
import type { AgencyBranding } from "@/lib/agencyBranding";

// Re-export the type so consumers can import everything from one place.
export type { AgencyBranding } from "@/lib/agencyBranding";

const AgencyBrandingContext = createContext<AgencyBranding | null>(null);

type Props = {
  branding: AgencyBranding;
  children: React.ReactNode;
};

export default function AgencyBrandingProvider({ branding, children }: Props) {
  // Memoize so context consumers don't re-render on every parent render
  // when the branding hasn't actually changed.
  const value = useMemo(() => branding, [
    branding.agencyId,
    branding.agencySlug,
    branding.agencyName,
    branding.logoUrl,
    branding.primaryColor,
    branding.secondaryColor,
    branding.fontFamily,
  ]);

  return (
    <AgencyBrandingContext.Provider value={value}>
      {children}
    </AgencyBrandingContext.Provider>
  );
}

export function useAgencyBranding(): AgencyBranding {
  const ctx = useContext(AgencyBrandingContext);
  if (!ctx) {
    // Hard error in dev so a misplaced consumer doesn't silently render
    // unbranded UI on a tenant page.
    throw new Error(
      "useAgencyBranding() called outside <AgencyBrandingProvider>. " +
        "Wrap the subtree in app/tenant/[agencySlug]/layout.tsx."
    );
  }
  return ctx;
}

// Safe variant for components that may render in either tenant or apex
// contexts (e.g. a shared footer). Returns null when no provider is mounted.
export function useOptionalAgencyBranding(): AgencyBranding | null {
  return useContext(AgencyBrandingContext);
}
