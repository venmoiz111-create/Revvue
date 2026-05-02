import LoginForm from "./LoginForm";

// Agency login page at acme.revvue.live/login.
//
// We rely on the parent tenant layout to validate that this subdomain
// belongs to an active agency and to provide branding via context. This
// page itself just renders the (client) form.
export const dynamic = "force-dynamic";

export default function TenantLoginPage() {
  return <LoginForm />;
}
