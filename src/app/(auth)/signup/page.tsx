import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getRoleHome } from "@/lib/auth/redirects";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Signup",
  description: "Create a candidate or employer account on JobPulse India.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleHome(user.role));
  }

  return (
    <AuthShell
      title="Create your account"
      description="Set up a role-based JobPulse India account and continue into the right workspace."
    >
      <SignupForm />
    </AuthShell>
  );
}
