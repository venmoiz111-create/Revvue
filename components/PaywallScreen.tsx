import PricingCards from "@/components/PricingCards";

type Props = {
  agencyName: string;
  founderEmail: string;
};

// Full-page paywall — replaces the dashboard once the trial has expired
// and the agency is still on plan = 'trial'. Review pages keep working
// outside this component because they live on a different route entirely.
export default function PaywallScreen({ agencyName, founderEmail }: Props) {
  const subject = encodeURIComponent(
    `Activate Revvue paid plan for ${agencyName}`
  );
  const mailto = `mailto:${founderEmail}?subject=${subject}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 px-6 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
          Trial ended
        </p>
        <h1 className="mt-4 font-serif text-3xl sm:text-5xl tracking-tight text-stone-900">
          Your free trial has ended.
        </h1>
        <p className="mt-5 text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Your customer-facing review pages are still live and still working.
          To get back into the dashboard and add new restaurants, email Ven to
          activate a paid plan. We&apos;ll handle billing manually — no credit
          card required.
        </p>
        <a
          href={mailto}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-7 py-4 text-base shadow-sm hover:bg-stone-800 transition-colors"
        >
          Email {founderEmail}
        </a>
      </div>

      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="font-serif text-2xl tracking-tight text-stone-900 text-center">
          Pick a plan to mention in your email
        </h2>
        <p className="mt-2 text-stone-500 text-center text-sm">
          Pricing is informational. Ven will send you an invoice via PayPal,
          Interac, or Stripe based on your preference.
        </p>
        <div className="mt-8">
          <PricingCards ctaHref={mailto} ctaLabel="Email Ven" />
        </div>
      </div>
    </main>
  );
}
