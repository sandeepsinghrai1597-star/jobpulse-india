"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/lib/validation/schemas";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(parsed.error.issues[0]?.message ?? "Please complete the signup form.");
      return;
    }

    setIsSubmitting(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          role: parsed.data.role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.session) {
      setMessage("Account created. Check your email to confirm your account before signing in.");
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    router.push(parsed.data.role === "employer" ? "/employer" : "/dashboard");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      <Input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Input placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <Select value={role} onValueChange={(value: "candidate" | "employer") => setRole(value)}>
        <SelectTrigger className="w-full rounded-2xl">
          <SelectValue placeholder="Choose account type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="candidate">Candidate</SelectItem>
          <SelectItem value="employer">Employer</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Signup failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full rounded-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
