import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revvue — Voice-powered Google reviews for restaurants",
  description:
    "Diners speak for 15 seconds. AI cleans it up. Your Google review count climbs. No app, no login, no typing.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <NavBar />

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs text-stone-600 shadow-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Live at restaurants across Canada
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-stone-900">
            Your customers won&apos;t type a review.
            <br />
            <span className="text-stone-500">They&apos;ll talk for 15 seconds.</span>
          </h1>
          <p className="mt-7 text-stone-600 text-xl leading-relaxed max-w-2xl mx-auto">
            Scan the QR. Pick a star. Hold the button, speak. Done.
            Revvue turns voice into a polished Google review and hands it
            straight to the paste screen — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-8 py-4 text-base shadow-sm hover:bg-stone-800 transition-colors"
            >
              Try it live — no signup →
            </Link>
            <Link
              href="/agencies"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 text-stone-900 font-medium px-8 py-4 text-base hover:bg-stone-100 transition-colors"
            >
              I&apos;m a marketing agency →
            </Link>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            No app download. No account. Works on any phone.
          </p>
        </div>
      </section>

      {/* DINER FLOW — visual steps */}
      <section className="px-6 pb-24 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto py-16">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-stone-500">
            The diner experience
          </p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight text-center">
            Easier than leaving a tip.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {[
              {
                step: "01",
                icon: "⬛",
                emoji: true,
                title: "Scan",
                body: "QR code on the table. No app download, no sign-up. The branded review page opens instantly.",
                time: null,
              },
              {
                step: "02",
                icon: "★",
                emoji: true,
                title: "Rate",
                body: "Tap 1–5 stars. One tap. Already halfway done.",
                time: null,
              },
              {
                step: "03",
                icon: "🎤",
                emoji: true,
                title: "Speak",
                body: "Hold the button. Talk for 10–30 seconds about what they loved. AI cleans it into a real review.",
                time: "~20 seconds",
              },
              {
                step: "04",
                icon: "✓",
                emoji: true,
                title: "Post",
                body: "Review is copied to clipboard. Google opens. One long-press, tap Paste, tap Submit.",
                time: "Under 30s total",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%_-_0px)] w-full h-px border-t-2 border-dashed border-stone-200 z-0" />
                )}
                <div className="relative z-10 rounded-2xl border border-stone-200 bg-stone-50 p-6">
                  <div className="text-2xl mb-3">
                    {s.step === "02" ? (
                      <span className="text-amber-400">★</span>
                    ) : s.step === "01" ? (
                      <span className="text-stone-900">▣</span>
                    ) : s.step === "03" ? (
                      <span>🎙</span>
                    ) : (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                  <span className="font-serif text-stone-400 text-sm">
                    {s.step}
                  </span>
                  <h3 className="mt-1 font-medium text-stone-900 text-base">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {s.body}
                  </p>
                  {s.time && (
                    <span className="mt-3 inline-block text-xs font-medium text-stone-500 bg-stone-200 rounded-full px-2.5 py-0.5">
                      {s.time}
                    </span>
                  )}
                </div>
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
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Why voice
              </p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight">
                People don&apos;t write.
                <br />
                They talk.
              </h2>
              <p className="mt-5 text-stone-600 leading-relaxed">
                Review platforms that send emails or SMS asking customers to
                &ldquo;share your thoughts&rdquo; convert at 2–5%.
                Revvue captures the customer while they&apos;re still at the
                table, holding warm coffee, and gives them the easiest review
                experience that exists.
              </p>
              <p className="mt-4 text-stone-600 leading-relaxed">
                The AI does one job: clean up filler words and add punctuation.
                It never rewrites, never improves, never removes slang. The
                review reads like a real person typed it — because they did.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "< 30s", label: "Total time for a diner to post" },
                { stat: "0", label: "App downloads required" },
                { stat: "iOS + Android", label: "Hardened on both platforms" },
                { stat: "Real voice", label: "AI preserves slang & dialect" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <div className="font-serif text-2xl text-stone-900">
                    {s.stat}
                  </div>
                  <div className="mt-1 text-xs text-stone-500 leading-snug">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AGENCY CALLOUT */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-stone-900 text-stone-50 px-10 py-14 sm:px-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                For marketing agencies
              </p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl tracking-tight">
                Put your brand on it. Resell it to every restaurant you manage.
              </h2>
              <p className="mt-5 text-stone-300 leading-relaxed">
                Revvue&apos;s white-label tier gives you your own subdomain, your
                own logo, your own colors on every review page — and a dashboard
                to manage every client from one login. Charge what you want.
                Revvue charges you a flat monthly fee.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/agencies"
                  className="inline-flex items-center justify-center rounded-full bg-stone-50 text-stone-900 font-medium px-7 py-3.5 text-sm hover:bg-white transition-colors"
                >
                  See the agency plan →
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full border border-stone-600 text-stone-200 font-medium px-7 py-3.5 text-sm hover:bg-stone-800 transition-colors"
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
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
            Your next 5-star review is one scan away.
          </h2>
          <p className="mt-4 text-stone-600">
            Add Revvue to your tables today. No contracts, no setup fees.
          </p>
          <a
            href="mailto:ven@revvue.live?subject=Revvue%20—%20Get%20started"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-8 py-4 text-base shadow-sm hover:bg-stone-800 transition-colors"
          >
            Get started — email ven@revvue.live
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function NavBar() {
  return (
    <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto border-b border-stone-200 bg-stone-50 sticky top-0 z-20">
      <span className="font-serif text-xl tracking-tight text-stone-900">
        Revvue
      </span>
      <nav className="flex items-center gap-5 text-sm">
        <Link
          href="/agencies"
          className="text-stone-600 hover:text-stone-900 transition-colors hidden sm:block"
        >
          For agencies
        </Link>
        <a
          href="mailto:ven@revvue.live?subject=Revvue%20—%20Get%20started"
          className="rounded-full bg-stone-900 text-stone-50 font-medium px-4 py-2 hover:bg-stone-800 transition-colors"
        >
          Get started
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 py-10 px-6 text-center text-sm text-stone-500">
      <p>
        &copy; {new Date().getFullYear()} Revvue &mdash; Built in Toronto.
      </p>
      <p className="mt-2">
        Questions?{" "}
        <a
          href="mailto:ven@revvue.live"
          className="underline underline-offset-4 hover:text-stone-800"
        >
          ven@revvue.live
        </a>
      </p>
    </footer>
  );
}
