import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen h-dvh bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="font-serif text-xl tracking-tight text-stone-900">
          Revvue
        </span>
        <Link
          href="/agencies"
          className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
        >
          For agencies →
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <p className="font-serif text-2xl tracking-tight text-stone-900">
            Revvue
          </p>

          <h1 className="mt-6 font-serif text-4xl sm:text-5xl leading-tight tracking-tight text-stone-900">
            Voice-powered Google reviews for restaurants.
          </h1>

          <p className="mt-5 text-stone-600 text-lg leading-relaxed">
            Your customers speak. We clean it up. You get more 5-star reviews.
          </p>

          <a
            href="mailto:ven@revvue.live?subject=Revvue%20—%20Get%20started"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-7 py-4 text-base shadow-sm hover:bg-stone-800 active:bg-stone-950 transition-colors"
          >
            Get started — $99/month
          </a>
          <p className="mt-6 text-sm text-stone-500">
            Marketing agency?{" "}
            <Link
              href="/agencies"
              className="underline underline-offset-4 hover:text-stone-800"
            >
              White-label for your clients.
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
