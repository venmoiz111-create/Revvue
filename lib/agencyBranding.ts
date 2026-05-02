// Pure (server- and client-safe) helpers for agency branding.
//
// This deliberately lives OUTSIDE of any "use client" module so that
// server components (e.g. tenant layout) can call brandingFromRow().
// Anything React/context-related belongs in components/AgencyBrandingProvider.tsx.

export type AgencyBranding = {
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

// Server prop shape — what a layout/page typically fetches from Supabase.
// Snake_case mirrors the database column names so callers can pass rows
// in directly.
export type AgencyRow = {
  agency_id: string;
  slug?: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
};

export const BRANDING_DEFAULTS = {
  primaryColor: "#1c1917",
  secondaryColor: "#f5f5f4",
  fontFamily: "serif",
} as const;

export function brandingFromRow(
  row: AgencyRow,
  agencySlug: string
): AgencyBranding {
  return {
    agencyId: row.agency_id,
    agencySlug,
    agencyName: row.name,
    logoUrl: row.logo_url ?? null,
    primaryColor: row.primary_color ?? BRANDING_DEFAULTS.primaryColor,
    secondaryColor: row.secondary_color ?? BRANDING_DEFAULTS.secondaryColor,
    fontFamily: row.font_family ?? BRANDING_DEFAULTS.fontFamily,
  };
}
