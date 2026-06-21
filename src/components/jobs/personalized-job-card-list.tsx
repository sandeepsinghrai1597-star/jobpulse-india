"use client";

import type { Job } from "@/types";
import { JobCard } from "@/components/jobs/job-card";
import { useJobPersonalization } from "@/components/jobs/job-personalization-context";

export function PersonalizedJobCardList({
  jobs,
  showMatches = false,
}: {
  jobs: Job[];
  showMatches?: boolean;
}) {
  const { isSignedIn, matchSummaries, stateByJobId } = useJobPersonalization();

  return (
    <div className="grid gap-5">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          matchSummary={showMatches ? matchSummaries[job.id] ?? null : null}
          isSaved={stateByJobId[job.id]?.isSaved ?? false}
          isApplied={stateByJobId[job.id]?.isApplied ?? false}
          isSignedIn={isSignedIn}
        />
      ))}
    </div>
  );
}
