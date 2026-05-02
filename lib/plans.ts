// Plan tiers — display only, no billing logic.
// These map the free-text `agencies.plan` column to user-facing copy
// and are also used to set `max_clients` when the founder manually
// updates an agency to a paid tier (see docs/manual-billing-sql.md).
export type PlanId = "trial" | "starter" | "growth" | "scale" | "unlimited";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number | null; // null = trial / contact us
  priceLabel: string;
  maxClients: number | null;   // null = unlimited
  maxClientsLabel: string;
  blurb: string;
  highlights: string[];
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 99,
    priceLabel: "$99",
    maxClients: 5,
    maxClientsLabel: "Up to 5 restaurants",
    blurb: "For agencies just starting to resell reviews.",
    highlights: [
      "Your branding & subdomain",
      "QR codes & dashboard",
      "Voice review flow per client",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 299,
    priceLabel: "$299",
    maxClients: 25,
    maxClientsLabel: "Up to 25 restaurants",
    blurb: "Most agencies pick this once they've landed a few clients.",
    highlights: [
      "Everything in Starter",
      "Higher client cap",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 799,
    priceLabel: "$799",
    maxClients: 100,
    maxClientsLabel: "Up to 100 restaurants",
    blurb: "For agencies with a real restaurant book.",
    highlights: [
      "Everything in Growth",
      "Up to 100 restaurants",
      "Quarterly check-ins",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    priceMonthly: 1499,
    priceLabel: "$1,499",
    maxClients: null,
    maxClientsLabel: "Unlimited restaurants",
    blurb: "If you're running a portfolio, take the cap off.",
    highlights: [
      "Everything in Scale",
      "Unlimited restaurants",
      "Founder Slack channel",
    ],
  },
];

export function getPlan(id: string | null | undefined): Plan | null {
  if (!id) return null;
  return PLANS.find((p) => p.id === id) ?? null;
}
