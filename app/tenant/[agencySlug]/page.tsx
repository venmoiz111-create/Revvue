import { redirect } from "next/navigation";

type Props = { params: { agencySlug: string } };

export default function TenantRootPage({ params }: Props) {
  redirect(`/dashboard`);
}
