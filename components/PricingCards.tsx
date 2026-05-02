import { PLANS, type Plan } from "@/lib/plans";

type Props = {
  // CTA destination per card. Defaults to /signup. On the paywall we pass
  // a mailto: link so the user can email Ven to upgrade.
  ctaHref?: string;
  ctaLabel?: string;
  // Optional highlight — render the matching plan with a slightly louder
  // visual weight (e.g. "Growth" on the landing page).
  highlightPlanId?: Plan["id"];
  className?: string;
};

export default function PricingCards({
  ctaHref = "/signup",
  ctaLabel = "Start free trial",
  highlightPlanId = "growth",
  className = "",
}: Props) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}
    >
      {PLANS.map((plan) => {
        const highlighted = plan.id === highlightPlanId;
        return (
          <div
            key={plan.id}
            className={[
              "rounded-2xl border bg-white p-6 flex flex-col",
              highlighted
                ? "border-stone-900 shadow-md"
                : "border-stone-200 shadow-sm",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-stone-900 tracking-tight">
                {plan.name}
              </h3>
              {highlighted ? (
                <span className="text-[10px] uppercase tracking-widest bg-stone-900 text-stone-50 rounded-full px-2 py-1">
                  Popular
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-serif text-3xl text-stone-900">
                {plan.priceLabel}
              </span>
              <span className="text-stone-500 text-sm">/mo</span>
            </div>
            <p className="mt-1 text-stone-500 text-sm">
              {plan.maxClientsLabel}
            </p>
            <p className="mt-4 text-stone-600 leading-relaxed text-sm">
              {plan.blurb}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {plan.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-stone-900"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <a
              href={ctaHref}
              className={[
                "mt-6 inline-flex items-center justify-center rounded-full font-medium px-4 py-3 text-sm transition-colors",
                highlighted
                  ? "bg-stone-900 text-stone-50 hover:bg-stone-800"
                  : "bg-stone-100 text-stone-900 hover:bg-stone-200",
              ].join(" ")}
            >
              {ctaLabel}
            </a>
          </div>
        );
      })}
    </div>
  );
}
