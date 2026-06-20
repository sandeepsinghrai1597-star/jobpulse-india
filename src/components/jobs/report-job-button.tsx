"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const reportReasons = [
  "Fake job or scam",
  "Payment demand",
  "Misleading salary",
  "Fake government listing",
  "Broken or suspicious apply link",
] as const;

export function ReportJobButton({ jobIdentifier }: { jobIdentifier: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<(typeof reportReasons)[number]>("Fake job or scam");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/jobs/${jobIdentifier}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
        details,
      }),
    });

    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(result.message ?? "We could not submit the report.");
      setIsSubmitting(false);
      return;
    }

    setMessage(result.message ?? "Report submitted.");
    setIsSubmitting(false);
    setIsOpen(false);
    setDetails("");
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Report not sent</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertTitle>Report sent</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {isOpen ? (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <label className="block text-sm font-medium text-slate-900">
            Reason
            <select
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              value={reason}
              onChange={(event) => setReason(event.target.value as (typeof reportReasons)[number])}
            >
              {reportReasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-900">
            Details
            <Textarea
              className="mt-2 min-h-24 bg-white"
              placeholder="Share anything suspicious: payment request, false employer, wrong salary, fake source, or misleading apply process."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit report"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsOpen(true)}>
        <AlertTriangle className="size-4" />
        Report fake job
      </Button>
    </div>
  );
}

