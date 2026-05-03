type Props = {
  trialEndsAt: string | null;
  plan: string;
  founderEmail: string;
};

export default function TrialBanner({ trialEndsAt, plan }: Props) {
  if (plan !== "trial" || !trialEndsAt) return null;

  const ends = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));

  if (ends <= now) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-2.5 text-sm text-center">
      You&apos;re on a free trial —{" "}
      <strong>{daysLeft} day{daysLeft === 1 ? "" : "s"} remaining.</strong>
    </div>
  );
}
