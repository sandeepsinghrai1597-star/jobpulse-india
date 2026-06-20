import { buildMetadata } from "@/lib/seo";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = buildMetadata({
  title: "Forgot password",
  description: "Reset your JobPulse India password with a secure Supabase reset email.",
  path: "/auth/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we’ll send you a secure link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
