import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revvue — Voice-powered Google reviews for local businesses",
  description:
    "Customers speak for 15 seconds. AI cleans it up. Your Google review count climbs. No app, no login, no typing.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <NavBar />

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-1.5 text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Live at local businesses across Canada
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-white">
            Your customers won&apos;t type a review.
            <br />
            <span className="text-green-500">They&apos;ll talk for 15 seconds.</span>
          </h1>
          <p className="mt-7 text-zinc-400 text-xl leading-relaxed max-w-2xl mx-auto">
            Scan the QR. Pick a star. Hold the button and speak. Revvue turns voice into a polished Google review and hands it straight to the paste screen in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-8 py-4 text-base hover:bg-green-400 transition-colors"
            >
              Try it live, no signup →
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 text-white font-medium px-8 py-4 text-base hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
            >
              Get started free →
            </Link>
          </div>
          <p className="mt-6">
            <Link
              href="/video"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
            >
              <span className="w-7 h-7 rounded-full border border-zinc-700 inline-flex items-center justify-center group-hover:border-green-500 group-hover:text-green-500 transition-colors">
                <svg className="w-3 h-3 translate-x-px" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 3.5L12 8l-5.5 4.5V3.5z" />
                </svg>
              </span>
              Watch the 45-second demo video
            </Link>
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            Works for any local business. No credit card required.
          </p>
        </div>
      </section>

      {/* DINER FLOW */}
      <section className="px-6 pb-24 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto py-16">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
            The diner experience
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-center text-white">
            Easier than leaving a tip.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {[
              {
                step: "01",
                icon: "▣",
                title: "Scan",
                body: "QR code on the table. No app download, no sign-up. The branded review page opens instantly.",
                time: null,
              },
              {
                step: "02",
                icon: "★",
                title: "Rate",
                body: "Tap 1 to 5 stars. One tap. Already halfway done.",
                time: null,
              },
              {
                step: "03",
                icon: "🎙",
                title: "Speak",
                body: "Hold the button. Talk for 10 to 30 seconds about what they loved. AI cleans it into a real review.",
                time: "~20 seconds",
              },
              {
                step: "04",
                icon: "✓",
                title: "Post",
                body: "Review is copied to clipboard. Google opens. One long-press, tap Paste, tap Submit.",
                time: "Under 30s total",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-2xl mb-3">
                  {s.step === "02" ? (
                    <span className="text-green-500">★</span>
                  ) : s.step === "04" ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </div>
                <span className="text-zinc-600 text-sm font-mono">{s.step}</span>
                <h3 className="mt-1 font-bold text-white text-base">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{s.body}</p>
                {s.time && (
                  <span className="mt-3 inline-block text-xs font-semibold text-green-500 bg-green-500/10 rounded-full px-2.5 py-0.5">
                    {s.time}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY VOICE WINS */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
                Why voice
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                People don&apos;t write.
                <br />
                They talk.
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                Review platforms that send emails or SMS asking customers to share their thoughts convert at 2 to 5%. Revvue captures the customer while they&apos;re still at the table and gives them the easiest review experience that exists.
              </p>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                The AI does one job: clean up filler words and add punctuation. It never rewrites, never improves, never removes slang. The review reads like a real person typed it because they did.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "< 30s", label: "Total time for a diner to post" },
                { stat: "0", label: "App downloads required" },
                { stat: "iOS + Android", label: "Hardened on both platforms" },
                { stat: "Real voice", label: "AI preserves slang and dialect" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="text-2xl font-black text-white">{s.stat}</div>
                  <div className="mt-1 text-xs text-zinc-500 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AGENCY CALLOUT */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-green-500/20 bg-green-500/5 px-10 py-14 sm:px-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.25em] text-green-500 font-semibold">
                For marketing agencies
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
                Put your brand on it. Resell it to every restaurant you manage.
              </h2>
              <p className="mt-5 text-zinc-400 leading-relaxed">
                Revvue&apos;s white-label tier gives you your own subdomain, your own logo, your own colors on every review page and a dashboard to manage every client from one login. Charge what you want.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/agencies"
                  className="inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-7 py-3.5 text-sm hover:bg-green-400 transition-colors"
                >
                  See the agency plan →
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-700 text-white font-medium px-7 py-3.5 text-sm hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
                >
                  Start 14-day free trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Your next 5-star review is one scan away.
          </h2>
          <p className="mt-4 text-zinc-400">
            Add Revvue to your tables today. No contracts, no setup fees.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-8 py-4 text-base hover:bg-green-400 transition-colors"
          >
            Start your free trial →
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
      <span className="text-xl font-black tracking-tight text-white">
        Revvue
      </span>
      <nav className="flex items-center gap-5 text-sm">
        <Link
          href="/agencies"
          className="text-zinc-400 hover:text-white transition-colors hidden sm:block"
        >
          For agencies
        </Link>
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
          Get started
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
          href="mailto:ven@revvue.live"
          className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
        >
          ven@revvue.live
        </a>
      </p>
    </footer>
  );
}
