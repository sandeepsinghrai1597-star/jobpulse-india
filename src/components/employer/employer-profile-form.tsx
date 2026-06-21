"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { employerProfileSchema } from "@/lib/validation/schemas";
import type { EmployerProfile } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmployerProfileForm({ initialProfile }: { initialProfile: EmployerProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = employerProfileSchema.safeParse(profile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete all required fields.");
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/employer/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.message ?? "Unable to save employer profile.");
      setIsSaving(false);
      return;
    }

    setMessage(result.message ?? "Employer profile updated successfully.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Company name"
          value={profile.companyName}
          onChange={(event) => setProfile((current) => ({ ...current, companyName: event.target.value }))}
        />
        <Input
          placeholder="Company website"
          type="url"
          value={profile.website}
          onChange={(event) => setProfile((current) => ({ ...current, website: event.target.value }))}
        />
        <Input
          placeholder="Company email"
          type="email"
          value={profile.companyEmail ?? ""}
          onChange={(event) => setProfile((current) => ({ ...current, companyEmail: event.target.value }))}
        />
        <Input
          placeholder="Industry"
          value={profile.industry}
          onChange={(event) => setProfile((current) => ({ ...current, industry: event.target.value }))}
        />
        <Input
          placeholder="City"
          value={profile.city}
          onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))}
        />
        <Input
          placeholder="State"
          value={profile.state}
          onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))}
        />
        <Input
          placeholder="Logo URL"
          type="url"
          value={profile.logoUrl}
          onChange={(event) => setProfile((current) => ({ ...current, logoUrl: event.target.value }))}
        />
        <Input
          placeholder="Recruiter name"
          value={profile.recruiterName}
          onChange={(event) => setProfile((current) => ({ ...current, recruiterName: event.target.value }))}
        />
        <Input
          placeholder="Recruiter phone"
          value={profile.recruiterPhone}
          onChange={(event) => setProfile((current) => ({ ...current, recruiterPhone: event.target.value }))}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Trust signals</p>
        <p className="mt-2">Company email verification is recorded from your work email domain.</p>
        <p className="mt-1">
          Domain verification is not live yet, so recruiters should not rely on it as an active trust badge in production.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to save</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Button className="w-full rounded-full" disabled={isSaving} type="submit">
        {isSaving ? "Saving profile..." : "Save employer profile"}
      </Button>
    </form>
  );
}
