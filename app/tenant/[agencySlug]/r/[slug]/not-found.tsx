"use client";

import { useAgencyBranding } from "@/components/AgencyBrandingProvider";

// Agency-branded 404 for review pages.
//
// Notes on what's branded vs not:
//   - We pull primary color and font from the tenant context so the
//     "back" CTA still feels like the agency's brand.
//   - We avoid mentioning "Revvue" in the body copy — the customer
//     scanning a stale QR code shouldn't see our brand.
export default function NotFound() {
  const branding = useAgencyBranding();

  return (
    <main className="h-dvh min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={branding.agencyName}
            className="h-8 w-auto mx-auto object-contain"
          />
        ) : (
          <p className="text-sm tracking-widest uppercase text-stone-500">
            {branding.agencyName}
          </p>
        )}

        <h1
          className="mt-4 text-3xl text-stone-900 tracking-tight"
          style={{ fontFamily: branding.fontFamily }}
        >
          Restaurant not found
        </h1>

        <p className="mt-4 text-stone-600 leading-relaxed">
          This link doesn&apos;t match an active restaurant. Double-check the
          QR code, or ask your server to try again.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full text-stone-50 font-medium px-6 py-3"
          style={{ backgroundColor: branding.primaryColor }}
        >
          Back to {branding.agencyName}
        </a>
      </div>
    </main>
  );
}
