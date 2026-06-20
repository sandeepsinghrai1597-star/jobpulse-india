import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ExtractedRawJob, RawFetchedJobRow } from "@/server/job-fetcher/types";

function normalizeForHash(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function generateContentHash(job: ExtractedRawJob) {
  const urlTitleCompanyFingerprint = [
    normalizeForHash(job.raw_apply_url),
    normalizeForHash(job.raw_title),
    normalizeForHash(job.raw_company),
  ].join("|");

  if (normalizeForHash(job.raw_apply_url) && normalizeForHash(job.raw_title)) {
    return createHash("sha256").update(`url-title-company|${urlTitleCompanyFingerprint}`).digest("hex");
  }

  return createHash("sha256")
    .update(
      [
        normalizeForHash(job.raw_title),
        normalizeForHash(job.raw_company),
        normalizeForHash(job.raw_location),
        normalizeForHash(job.raw_description),
        normalizeForHash(job.raw_apply_url),
        normalizeForHash(job.raw_salary),
        normalizeForHash(job.raw_experience),
        normalizeForHash(job.raw_job_type),
        normalizeForHash(job.raw_posted_date),
        normalizeForHash(job.raw_deadline),
      ].join("|"),
    )
    .digest("hex");
}

export async function findExistingRawDuplicate(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  contentHash: string,
  currentRawJobId: string,
) {
  const { data } = await admin
    .from("raw_fetched_jobs")
    .select("id, status")
    .eq("content_hash", contentHash)
    .neq("id", currentRawJobId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Pick<RawFetchedJobRow, "id" | "status"> | null) ?? null;
}
