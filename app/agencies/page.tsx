import Link from "next/link";
import type { Metadata } from "next";
import PricingCards from "@/components/PricingCards";

export const metadata: Metadata = {
  title: "Revvue for Agencies — White-label voice reviews",
  description:
    "Resell voice-powered Google reviews to your local business clients under your own brand, your own subdomain, your own dashboard.",
};

const FEATURES = [
  {
    title: "Your branding",
    body:
      "Upload your logo, pick your brand color, choose your font. Every review page wears your colors, not ours.",
  },
  {
    title: "Your subdomain",
    body:
      "{youragency}.revvue.live out of the box. Custom domain support coming soon. Your clients never see Revvue.",
  },
  {
    title: "Your dashboard",
    body:
      "Add business clients, generate QR codes, see reviews land in real time. One log-in, all your accounts.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sign up & brand it",
    body:
      "14-day free trial. Pick your subdomain, drop in a logo URL, pick a color, and you're live.",
  },
  {
    n: "02",
    title: "Add a business",
    body:
      "Business name, Google review link. Done. Print the QR code and put it at the counter or on the table.",
  },
  {
    n: "03",
    title: "Customers speak",
    body:
      "They scan, hold to talk, and we clean up the transcript. They tap once to post to Google.",
  },
  {
    n: "04",
    title: "You bill the client",
    body:
      "Your agency, your contract, your price. Revvue runs the infra; you run the relationship.",
  },
];

const FAQS = [
  {
    q: "Do my clients ever see the Revvue brand?",
    a:
      "No. Review pages are served from your subdomain with your branding. The only place Revvue is mentioned to a customer is a small \"Powered by\" footer, which is removable on Scale and Unlimited plans.",
  },
  {
    q: "How does billing work?",
    a:
      "During the free trial it's nothing. After that, billing is handled directly with the founder via PayPal, Interac, or invoice. No credit card on file. Email ven@revvue.live to activate a paid plan.",
  },
  {
    q: "What happens after the 14-day trial?",
    a:
      "Your dashboard shows a friendly upgrade prompt. Review pages KEEP WORKING — your clients are not impacted. We give you time to settle billing on your terms.",
  },
  {
    q: "Can I bring my own domain?",
    a:
      "Subdomain ({you}.revvue.live) on day one. Custom domain (reviews.youragency.com) is rolling out — ask us.",
  },
  {
    q: "Is the voice transcription private?",
    a:
      "Yes. Voice never leaves the customer's phone. Only the cleaned-up text transcript is sent to our server. We use that text to log review activity to your dashboard.",
  },
];

export default function AgenciesLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 text-stone-900">
      <NavBar />

      {/* HERO */}
      <section className="px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            For marketing agencies
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            White-label voice reviews
            <br />
            for your restaurant clients.
          </h1>
          <p className="mt-6 text-stone-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Resell the same voice-to-Google-review flow restaurants are paying
            us $99/month for — under your brand, on your subdomain, billed your
            way.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-7 py-4 text-base shadow-sm hover:bg-stone-800 transition-colors"
            >
              Start your 14-day free trial
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 text-stone-900 font-medium px-7 py-4 text-base hover:bg-stone-100 transition-colors"
            >
              See pricing
            </a>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            No credit card. No payment integration. Email-based billing.
          </p>
        </div>
      </section>

      {/* 3 FEATURES */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white border border-stone-200 p-7 shadow-sm"
            >
              <h3 className="font-serif text-xl tracking-tight">{f.title}</h3>
              <p className="mt-3 text-stone-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-24 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto py-16">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              How it works
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight">
              From signup to first review in an afternoon.
            </h2>
          </div>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-stone-200 p-6 bg-stone-50"
              >
                <span className="font-serif text-stone-400 text-2xl">
                  {s.n}
                </span>
                <h3 className="mt-2 font-medium text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              Pricing
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight">
              One flat price. As many restaurants as you can land.
            </h2>
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto">
              All plans include white-label branding, your own subdomain, and
              the full review dashboard. The only difference is how many
              restaurants you can roll out.
            </p>
          </div>
          <div className="mt-12">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              FAQ
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight">
              The questions every agency asks first.
            </h2>
          </div>
          <dl className="mt-10 space-y-6">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl bg-white border border-stone-200 p-6 shadow-sm"
              >
                <dt className="font-medium text-stone-900">{f.q}</dt>
                <dd className="mt-2 text-stone-600 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto rounded-3xl bg-stone-900 text-stone-50 p-12 sm:p-16 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            Stand up your own review brand today.
          </h2>
          <p className="mt-4 text-stone-300 max-w-xl mx-auto">
            Spin up your subdomain in two minutes. Add your first restaurant
            this afternoon. Bill them next week.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-50 text-stone-900 font-medium px-7 py-4 text-base hover:bg-white"
          >
            Start your 14-day free trial
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function NavBar() {
  return (
    <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
      <Link
        href="/"
        className="font-serif text-xl tracking-tight text-stone-900"
      >
        Revvue
      </Link>
      <nav className="flex items-center gap-6 text-sm text-stone-600">
        <a href="#pricing" className="hover:text-stone-900 transition-colors">
          Pricing
        </a>
        <Link
          href="/signup"
          className="rounded-full bg-stone-900 text-stone-50 font-medium px-4 py-2 hover:bg-stone-800 transition-colors"
        >
          Start free trial
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 py-10 px-6 text-center text-sm text-stone-500">
      <p>
        &copy; {new Date().getFullYear()} Revvue. Built in Toronto.
      </p>
      <p className="mt-2">
        Questions?{" "}
        <a
          href={`mailto:${
            process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live"
          }`}
          className="underline underline-offset-4 hover:text-stone-800"
        >
          {process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "ven@revvue.live"}
        </a>
      </p>
    </footer>
  );
}
