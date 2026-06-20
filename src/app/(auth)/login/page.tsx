import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getRoleHome } from "@/lib/auth/redirects";
import { buildMetadata } from "@/lib/seo";

function getSafeNextPath(nextPath: string | string[] | undefined) {
  if (typeof nextPath !== "string" || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export const metadata = buildMetadata({
  title: "Login",
  description: "Sign in to JobPulse India as a candidate, employer, or admin.",
  path: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleHome(user.role));
  }

  return (
    <AuthShell
      title="Login to JobPulse India"
      description="Secure Supabase Auth login for candidates, employers, and admins."
    >
      <LoginForm redirectTo={nextPath} />
    </AuthShell>
  );
}
