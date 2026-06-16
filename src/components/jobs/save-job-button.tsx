"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SaveJobButton({ jobIdentifier }: { jobIdentifier: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/jobs/${jobIdentifier}/save`, {
      method: "POST",
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(result.message ?? "We could not save this job.");
      setIsSaving(false);
      return;
    }

    setMessage(result.message ?? "Job saved.");
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button variant="outline" className="rounded-full" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Job"}
      </Button>
    </div>
  );
}
