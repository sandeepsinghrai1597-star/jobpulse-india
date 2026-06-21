"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, User } from "lucide-react";
import { signupSchema } from "@/lib/validation/schemas";
import { type AuthErrorState, logAuthError, mapAuthError } from "@/lib/auth/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RoleSelector } from "@/components/auth/role-selector";

export function SignupForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = signupSchema.safeParse({
      fullName,
      email,
      phone,
      role,
      password,
    });

    if (!parsed.success) {
      setError({
        title: "Signup details incomplete",
        message: parsed.error.issues[0]?.message ?? "Please complete the signup form.",
      });
      return;
    }

    setIsSubmitting(true);

    let supabase;
    try {
      supabase = createClient();
    } catch (createClientError) {
      logAuthError("signup:create-client", createClientError);
      setError(mapAuthError(createClientError));
      setIsSubmitting(false);
      return;
    }

    const redirectPath = parsed.data.role === "employer" ? "/employer" : "/dashboard";

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectPath}`,
          data: {
            full_name: parsed.data.fullName,
            phone: parsed.data.phone,
            role: parsed.data.role,
          },
        },
      });

      if (signUpError) {
        logAuthError("signup:sign-up", signUpError);
        setError(mapAuthError(signUpError));
        setIsSubmitting(false);
        return;
      }

      if (!data.session) {
        setMessage(
          "Account created. Check your email to confirm your account before signing in, unless email confirmations are disabled in Supabase Auth.",
        );
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      router.push(redirectPath);
    } catch (signUpError) {
      logAuthError("signup:unexpected", signUpError);
      setError(mapAuthError(signUpError));
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
      {/* Full Name Input */}
      <div className="space-y-2">
        <label htmlFor="fullname" className="text-sm font-semibold text-slate-900">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="fullname"
            type="text"
            placeholder="John Doe"
            disabled={isSubmitting}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-900">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400"
          />
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-semibold text-slate-900">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            disabled={isSubmitting}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400"
          />
        </div>
      </div>

      {/* Role Selector */}
      <RoleSelector value={role} onChange={setRole} />

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-slate-900">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-400"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">{error.title}</p>
          <p className="mt-1 text-sm text-red-800">{error.message}</p>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => formRef.current?.requestSubmit()}
            className="mt-3 text-sm font-semibold text-red-900 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Success Message */}
      {message ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">Check your email</p>
          <p className="mt-1 text-sm text-amber-800">{message}</p>
        </div>
      ) : null}

      {/* Submit Button */}
      <Button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline decoration-2 underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
