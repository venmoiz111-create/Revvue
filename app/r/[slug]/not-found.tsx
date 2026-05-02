import Link from "next/link";

export default function NotFound() {
  return (
    <main className="h-dvh min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="font-serif text-xl text-stone-500 tracking-tight">
          Revvue
        </p>

        <h1 className="mt-6 font-serif text-3xl text-stone-900 tracking-tight">
          Restaurant not found
        </h1>

        <p className="mt-4 text-stone-600 leading-relaxed">
          This link doesn&apos;t match an active Revvue restaurant. Double-check
          the QR code, or ask your server to try again.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-6 py-3 hover:bg-stone-800"
        >
          Go to Revvue
        </Link>
      </div>
    </main>
  );
}
