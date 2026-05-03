import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revvue for Agencies — White-label voice reviews",
  description:
    "Resell voice-powered Google reviews to your local business clients under your own brand, your own subdomain, your own dashboard.",
};

const FEATURES = [
  {
    title: "Your branding",
    body: "Upload your logo, pick your brand color, choose your font. Every review page wears your colors, not ours.",
  },
  {
    title: "Your subdomain",
    body: "{youragency}.revvue.live out of the box. Custom domain support coming soon. Your clients never see Revvue.",
  },
  {
    title: "Your dashboard",
    body: "Add business clients, generate QR codes, see reviews land in real time. One login, all your accounts.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sign up and brand it",
    body: "14-day free trial. Pick your subdomain, drop in a logo URL, pick a color, and you are live.",
  },
  {
    n: "02",
    title: "Add a business",
    body: "Business name, Google review link. Done. Print the QR code and put it at the counter or on the table.",
  },
  {
    n: "03",
    title: "Customers speak",
    body: "They scan, hold to talk, and we clean up the transcript. They tap once to post to Google.",
  },
  {
    n: "04",
    title: "You bill the client",
    body: "Your agency, your contract, your price. Revvue runs the infrastructure. You run the relationship.",
  },
];

const FAQS = [
  {
    q: "Do my clients ever see the Revvue brand?",
    a: "No. Review pages are served from your subdomain with your branding. The only place Revvue appears to a customer is a small Powered by footer.",
  },
  {
    q: "How does billing work?",
    a: "The 14-day trial is completely free. After that, we work out a plan together over email. No surprise charges, no credit card required upfront. Email team.revvue@gmail.com when your trial ends.",
  },
  {
    q: "What happens after the 14-day trial?",
    a: "Your dashboard shows a friendly upgrade prompt. Review pages keep working. Your clients are not impacted. We give you time to settle billing on your terms.",
  },
  {
    q: "Can I bring my own domain?",
    a: "Subdomain ({you}.revvue.live) on day one. Custom domain (reviews.youragency.com) is rolling out. Ask us.",
  },
  {
    q: "Is the voice transcription private?",
    a: "Yes. Voice never leaves the customer's phone. Only the cleaned-up text transcript is sent to our server. We use that text to log review activity to your dashboard.",
  },
];

export default function AgenciesLandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <NavBar />

      {/* HERO */}
      <section className="px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
            For marketing agencies
          </p>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black leading-[1.02] tracking-tight text-white">
            White-label voice reviews
            <br />
            for your restaurant clients.
          </h1>
          <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Resell the same voice-to-Google-review flow under your brand, on your subdomain, billed your way.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-7 py-4 text-base hover:bg-green-400 transition-colors"
            >
              Start your 14-day free trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 text-white font-medium px-7 py-4 text-base hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
            >
              See the demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            No credit card required. Email-based billing.
          </p>
        </div>
      </section>

      {/* 3 FEATURES */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-7"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <span className="text-green-500 text-lg">✦</span>
              </div>
              <h3 className="font-bold text-xl text-white tracking-tight">{f.title}</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-24 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto py-16">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
              How it works
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
              From signup to first review in an afternoon.
            </h2>
          </div>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <span className="text-green-500 text-2xl font-black font-mono">
                  {s.n}
                </span>
                <h3 className="mt-2 font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
              The questions every agency asks first.
            </h2>
          </div>
          <dl className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <dt className="font-bold text-white">{f.q}</dt>
                <dd className="mt-2 text-zinc-400 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto rounded-3xl border border-green-500/20 bg-green-500/5 p-12 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Stand up your own review brand today.
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Spin up your subdomain in two minutes. Add your first restaurant this afternoon. Bill them next week.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-7 py-4 text-base hover:bg-green-400 transition-colors"
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
    <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto border-b border-zinc-900 bg-black sticky top-0 z-20">
      <Link
        href="/"
        className="text-xl font-black tracking-tight text-white"
      >
        Revvue
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/login"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-green-500 text-black font-bold px-4 py-2 hover:bg-green-400 transition-colors"
        >
          Start free trial
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-10 px-6 text-center text-sm text-zinc-600">
      <p>&copy; {new Date().getFullYear()} Revvue. Built in Toronto.</p>
      <p className="mt-2">
        Questions?{" "}
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com"}`}
          className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
        >
          {process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com"}
        </a>
      </p>
    </footer>
  );
}
