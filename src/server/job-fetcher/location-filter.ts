import { parseJobSourceConfig } from "@/lib/jobs/source-config";
import type { ExtractedRawJob, JobSourceRecord } from "@/server/job-fetcher/types";

function buildLocationHaystack(job: ExtractedRawJob) {
  return [
    job.raw_location,
    job.raw_title,
    job.raw_description,
    JSON.stringify(job.raw_data_json ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterJobsForSourceLocationScope(source: JobSourceRecord, jobs: ExtractedRawJob[]) {
  const config = parseJobSourceConfig({
    sourceType: source.source_type,
    transportType: source.transport_type,
    config: source.config,
  });

  if (config.locationKeywords.length === 0) {
    return jobs;
  }

  return jobs.filter((job) => {
    const haystack = buildLocationHaystack(job);
    return config.locationKeywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
}

