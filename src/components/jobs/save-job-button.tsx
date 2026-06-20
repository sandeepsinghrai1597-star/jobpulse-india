"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SaveJobButton({
  jobIdentifier,
  isInitiallySaved = false,
  isSignedIn = false,
  loginRedirectTo = "/login",
  compact = false,
}: {
  jobIdentifier: string;
  isInitiallySaved?: boolean;
  isSignedIn?: boolean;
  loginRedirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!isSignedIn) {
      router.push(loginRedirectTo);
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/jobs/${jobIdentifier}/save`, {
      method: "POST",
    });

    const result = (await response.json()) as {
      message?: string;
      saved?: boolean;
      redirectTo?: string;
    };

    if (!response.ok) {
      setError(result.message ?? "We could not save this job.");
      setIsSaving(false);

      if (result.redirectTo) {
        router.push(result.redirectTo);
      }

      return;
    }

    setIsSaved(Boolean(result.saved));
    setMessage(result.message ?? "Job saved.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {!compact && error ? (
        <Alert variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {!compact && message ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        variant="outline"
        className="rounded-full"
        onClick={handleSave}
        disabled={isSaving}
        aria-label={compact ? (isSaved ? "Unsave job" : "Save job") : undefined}
        title={compact && message ? message : compact && error ? error : undefined}
      >
        {isSaving
          ? isSaved
            ? "Updating..."
            : "Saving..."
          : compact
            ? isSaved
              ? "Saved"
              : "Save"
            : isSaved
              ? "Unsave Job"
              : "Save Job"}
      </Button>
    </div>
  );
}
