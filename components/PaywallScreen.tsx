type Props = {
  agencyName: string;
  founderEmail: string;
};

export default function PaywallScreen({ agencyName, founderEmail }: Props) {
  const subject = encodeURIComponent(`Activate Revvue paid plan for ${agencyName}`);
  const mailto = `mailto:${founderEmail}?subject=${subject}`;

  return (
    <main className="min-h-screen bg-black px-6 py-16 flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-800/50 bg-red-950/30 px-4 py-1.5 text-xs text-red-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Trial ended
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Your free trial has ended.
        </h1>
        <p className="mt-5 text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
          Your customer-facing review pages are still live and working. To get back into the dashboard and add new restaurants, email us to activate a paid plan.
        </p>
        <a
          href={mailto}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-green-500 text-black font-bold px-7 py-4 text-base hover:bg-green-400 transition-colors"
        >
          Email {founderEmail} →
        </a>
        <p className="mt-4 text-xs text-zinc-600">
          No credit card required. We handle billing by email.
        </p>
      </div>
    </main>
  );
}
