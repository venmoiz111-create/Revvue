type Props = {
  trialEndsAt: string | null;
  plan: string;
  founderEmail: string;
};

// Top-of-dashboard banner. Renders only while the agency is on the trial
// plan. Once the founder has manually flipped them to a paid plan, the
// banner disappears.
export default function TrialBanner({
  trialEndsAt,
  plan,
  founderEmail,
}: Props) {
  if (plan !== "trial" || !trialEndsAt) return null;

  const ends = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));

  // If trial is already over, the layout will swap in the paywall instead
  // of rendering this banner. Keep this guard cheap.
  if (ends <= now) return null;

  const subject = encodeURIComponent("Activate Revvue paid plan");
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
      <span>
        <strong>Trial ends in {daysLeft} day{daysLeft === 1 ? "" : "s"}.</strong>{" "}
        Email{" "}
        <a
          href={`mailto:${founderEmail}?subject=${subject}`}
          className="underline underline-offset-4 hover:text-amber-950"
        >
          {founderEmail}
        </a>{" "}
        to activate a paid plan.
      </span>
      <a
        href={`mailto:${founderEmail}?subject=${subject}`}
        className="rounded-full bg-amber-900 text-amber-50 px-4 py-1.5 text-xs font-medium hover:bg-amber-800 transition-colors"
      >
        Email Ven
      </a>
    </div>
  );
}
