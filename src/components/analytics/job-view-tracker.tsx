"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

type JobViewTrackerProps = {
  jobId?: string | null;
  jobSlug: string;
  title: string;
  companyName: string;
  city?: string | null;
  sourceType?: string;
};

function getViewStorageKey(jobSlug: string) {
  return `jobpulse.analytics.job-view.${jobSlug}`;
}

export function JobViewTracker({
  jobId,
  jobSlug,
  title,
  companyName,
  city,
  sourceType,
}: JobViewTrackerProps) {
  useEffect(() => {
    const storageKey = getViewStorageKey(jobSlug);

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");

    void trackAnalyticsEvent({
      eventName: "job_view",
      jobId: jobId ?? undefined,
      eventData: {
        jobSlug,
        title,
        companyName,
        city: city ?? null,
        sourceType: sourceType ?? null,
      },
    });
  }, [city, companyName, jobId, jobSlug, sourceType, title]);

  return null;
}
