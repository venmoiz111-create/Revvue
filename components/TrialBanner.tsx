type Props = {
  trialEndsAt: string | null;
  plan: string;
  founderEmail: string;
};

export default function TrialBanner({ trialEndsAt, plan, founderEmail }: Props) {
  if (plan !== "trial" || !trialEndsAt) return null;

  const ends = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));

  if (ends <= now) return null;

  const urgent = daysLeft <= 3;

  return (
    <div className={[
      "px-6 py-2.5 text-sm text-center border-b flex items-center justify-center gap-4",
      urgent
        ? "bg-red-950/40 border-red-800/50 text-red-300"
        : "bg-green-500/5 border-green-500/20 text-zinc-400",
    ].join(" ")}>
      <span>
        Free trial{" "}
        <strong className={urgent ? "text-red-200" : "text-white"}>
          {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining
        </strong>
      </span>
      <a
        href={`mailto:${founderEmail}?subject=${encodeURIComponent("Activate Revvue paid plan")}`}
        className="text-xs font-semibold text-green-500 hover:text-green-400 transition-colors"
      >
        Activate plan →
      </a>
    </div>
  );
}
