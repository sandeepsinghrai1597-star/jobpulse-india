"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { CandidateVerificationStatus } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function VerifiedApplyPanel({
  jobIdentifier,
  applicationUrl,
  isSignedIn,
  verificationStatus,
}: {
  jobIdentifier: string;
  applicationUrl: string;
  isSignedIn: boolean;
  verificationStatus: CandidateVerificationStatus | null;
}) {
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVerified = verificationStatus === "verified";
  const isPending = verificationStatus === "pending";

  async function handleApply() {
    setIsApplying(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/jobs/${jobIdentifier}/apply`, {
      method: "POST",
    });

    const result = (await response.json()) as {
      message?: string;
      applyUrl?: string;
      redirectTo?: string;
    };

    if (!response.ok) {
      setError(result.message ?? "Application failed.");
      setIsApplying(false);

      if (result.redirectTo) {
        window.location.href = result.redirectTo;
      }

      return;
    }

    setMessage(result.message ?? "Application submitted.");
    setIsApplying(false);
    window.open(result.applyUrl ?? applicationUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      {!isSignedIn ? (
        <Alert>
          <LockKeyhole className="size-4" />
          <AlertTitle>Sign in required</AlertTitle>
          <AlertDescription>
            Sign in and complete your candidate profile before you can apply.
          </AlertDescription>
        </Alert>
      ) : isVerified ? (
        <Alert>
          <ShieldCheck className="size-4" />
          <AlertTitle>Verified candidate</AlertTitle>
          <AlertDescription>
            This job is open for verified candidate applications. We will record your application
            and then open the source page.
          </AlertDescription>
        </Alert>
      ) : isPending ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Verification pending</AlertTitle>
          <AlertDescription>
            Your profile review is still pending. Applications unlock automatically after approval.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Profile verification required</AlertTitle>
          <AlertDescription>
            Only verified candidates can apply for jobs. Finish your profile and request
            verification first.
          </AlertDescription>
        </Alert>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Application blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {message ? (
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Application submitted</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {isVerified ? (
          <Button className="rounded-full" onClick={handleApply} disabled={isApplying}>
            {isApplying ? "Submitting..." : "Apply as verified candidate"}
          </Button>
        ) : (
          <Button asChild className="rounded-full">
            <Link href={isSignedIn ? "/dashboard/profile" : "/login"}>Complete profile</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <Link href={applicationUrl} target="_blank">
            View source job
          </Link>
        </Button>
      </div>
    </div>
  );
}
