"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApplicantActions({
  applicationId,
  resumeHref,
}: {
  applicationId: string;
  resumeHref?: string | null;
}) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "shortlisted" | "rejected") {
    setError(null);
    setIsBusy(status);
    const response = await fetch(`/api/employer/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = (await response.json()) as { message?: string };
    setIsBusy(null);

    if (!response.ok) {
      setError(result.message ?? "Could not update applicant.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={Boolean(isBusy)}
          onClick={() => updateStatus("shortlisted")}
        >
          <CheckCircle2 className="size-4" />
          {isBusy === "shortlisted" ? "Saving..." : "Shortlist"}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          disabled={Boolean(isBusy)}
          onClick={() => updateStatus("rejected")}
          aria-label="Reject applicant"
          title="Reject applicant"
        >
          <ThumbsDown className="size-4" />
        </Button>
        <Button asChild size="sm" variant="outline" disabled={!resumeHref}>
          <a href={resumeHref || "#"} target="_blank" rel="noreferrer">
            <Download className="size-4" />
            Resume
          </a>
        </Button>
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
