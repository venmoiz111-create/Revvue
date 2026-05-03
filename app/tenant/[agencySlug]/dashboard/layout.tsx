import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DashboardSidebar from "@/components/DashboardSidebar";
import TrialBanner from "@/components/TrialBanner";
import PaywallScreen from "@/components/PaywallScreen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  children: React.ReactNode;
  params: { agencySlug: string };
};

const FOUNDER_EMAIL =
  process.env.NEXT_PUBLIC_FOUNDER_EMAIL || "team.revvue@gmail.com";

export default async function DashboardLayout({ children, params }: Props) {
  const supa = createSupabaseServer();

  // 1) Must be signed in.
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) {
    // Bounce to the tenant-scoped login on this same subdomain. Middleware
    // strips the /tenant/{slug} prefix internally so /login is the right
    // public path here.
    redirect("/login");
  }

  // 2) Must be a member of THIS agency. We use the admin client because
  //    we want to do the join across agency_users + agencies in a single
  //    query that bypasses RLS (this is a privileged authorization check).
  const { data: agency, error } = await supabaseAdmin
    .from("agencies")
    .select(
      "agency_id, slug, name, contact_email, plan, trial_ends_at, paid_until, max_clients, status"
    )
    .eq("slug", params.agencySlug)
    .maybeSingle();

  if (error || !agency) {
    console.error("Dashboard: agency lookup failed", error);
    redirect("/login");
  }

  const { data: membership } = await supabaseAdmin
    .from("agency_users")
    .select("role")
    .eq("agency_id", agency.agency_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    // Logged in, but not a member of THIS agency. Sign them out client-
    // side via redirect to login (login form re-enforces this on submit).
    redirect("/login");
  }

  // 3) Trial gating. Only the dashboard is gated — review pages live on a
  //    different route entirely and keep working forever.
  const trialEnded =
    agency.plan === "trial" &&
    agency.trial_ends_at &&
    new Date(agency.trial_ends_at as string).getTime() <= Date.now();

  if (trialEnded) {
    return (
      <PaywallScreen
        agencyName={agency.name as string}
        founderEmail={FOUNDER_EMAIL}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <TrialBanner
          plan={agency.plan as string}
          trialEndsAt={agency.trial_ends_at as string | null}
          founderEmail={FOUNDER_EMAIL}
        />
        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
