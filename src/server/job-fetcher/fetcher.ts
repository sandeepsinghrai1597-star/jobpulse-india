import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { enrichNormalizedJob } from "@/server/job-fetcher/ai-enrichment";
import { autoPublishNormalizedJob, isAutoPublishEnabled } from "@/server/job-fetcher/publisher";
import { findExistingRawDuplicate, generateContentHash } from "@/server/job-fetcher/dedupe";
import { filterJobsForSourceLocationScope } from "@/server/job-fetcher/location-filter";
import { normalizeRawJob } from "@/server/job-fetcher/normalizer";
import { extractRawJobsFromPayload } from "@/server/job-fetcher/parsers";
import { fetchSourcePayload, validateJobSource } from "@/server/job-fetcher/source-runner";
import { FetcherError, type BatchCounters, type BatchLogStatus, type ExtractedRawJob, type FetchTriggerType, type JobSourceRecord, type RawFetchedJobRow, type SourceRunResult } from "@/server/job-fetcher/types";

function logBatch(batchId: string, source: JobSourceRecord, step: string, details?: Record<string, unknown>) {
  console.info("[job-fetcher]", JSON.stringify({ batchId, sourceId: source.id, sourceName: source.name, step, ...details }));
}

async function createBatch(sourceId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await admin
    .from("job_fetch_batches")
    .insert({
      source_id: sourceId,
      status: "running",
    } as never)
    .select("id")
    .maybeSingle();
  const batchRow = data as { id?: string } | null;

  if (error || !batchRow?.id) {
    throw new Error(error?.message ?? "Unable to create fetch batch.");
  }

  return batchRow.id;
}

async function updateBatch(batchId: string, patch: {
  status: BatchLogStatus;
  counters: BatchCounters;
  errorMessage?: string | null;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  await admin
    .from("job_fetch_batches")
    .update({
      finished_at: new Date().toISOString(),
      status: patch.status,
      total_found: patch.counters.totalFound,
      total_new: patch.counters.totalNew,
      total_duplicates: patch.counters.totalDuplicates,
      error_message: patch.errorMessage ?? null,
    } as never)
    .eq("id", batchId);
}

async function updateSourceTimestamps(sourceId: string, patch: { success: boolean; message?: string | null }) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const now = new Date().toISOString();
  await admin
    .from("job_sources")
    .update({
      last_fetched_at: now,
      last_success_at: patch.success ? now : null,
      last_error: patch.success ? null : patch.message ?? "Unknown fetch failure.",
    } as never)
    .eq("id", sourceId);
}

function deriveBatchStatus(counters: BatchCounters): BatchLogStatus {
  if (counters.totalFound === 0 || counters.totalFailed === counters.totalFound) {
    return "failed";
  }

  if (counters.totalFailed > 0) {
    return "partial_failed";
  }

  return "success";
}

async function insertRawJob(source: JobSourceRecord, batchId: string, contentHash: string, job: ExtractedRawJob) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await admin
    .from("raw_fetched_jobs")
    .insert({
      source_id: source.id,
      fetch_batch_id: batchId,
      raw_title: job.raw_title,
      raw_company: job.raw_company,
      raw_location: job.raw_location,
      raw_description: job.raw_description,
      raw_apply_url: job.raw_apply_url,
      raw_salary: job.raw_salary,
      raw_experience: job.raw_experience,
      raw_job_type: job.raw_job_type,
      raw_posted_date: job.raw_posted_date,
      raw_deadline: job.raw_deadline,
      raw_data_json: job.raw_data_json,
      content_hash: contentHash,
      status: "new",
    } as never)
    .select("*")
    .maybeSingle();
  const rawRow = data as RawFetchedJobRow | null;

  if (error || !rawRow?.id) {
    throw new Error(error?.message ?? "Unable to save raw fetched job.");
  }

  return rawRow;
}

async function updateRawJobStatus(rawJobId: string, status: RawFetchedJobRow["status"]) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  await admin.from("raw_fetched_jobs").update({ status } as never).eq("id", rawJobId);
}

async function insertNormalizedJob(rawJobId: string, normalizedJob: Awaited<ReturnType<typeof enrichNormalizedJob>>) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await admin.from("normalized_jobs").insert({
    raw_job_id: rawJobId,
    title: normalizedJob.title,
    slug: normalizedJob.slug ?? "",
    company_name: normalizedJob.company_name,
    description: normalizedJob.description,
    responsibilities: normalizedJob.responsibilities,
    requirements: normalizedJob.requirements,
    skills: normalizedJob.skills,
    salary_min: normalizedJob.salary_min,
    salary_max: normalizedJob.salary_max,
    salary_type: normalizedJob.salary_type,
    city: normalizedJob.city,
    state: normalizedJob.state,
    country: normalizedJob.country,
    job_type: normalizedJob.job_type,
    work_mode: normalizedJob.work_mode,
    experience_min: normalizedJob.experience_min,
    experience_max: normalizedJob.experience_max,
    education_required: normalizedJob.education_required,
    industry: normalizedJob.industry,
    openings: normalizedJob.openings,
    deadline: normalizedJob.deadline,
    apply_url: normalizedJob.apply_url,
    source_url: normalizedJob.source_url,
    source_type: normalizedJob.source_type,
    quality_score: normalizedJob.quality_score,
    duplicate_score: normalizedJob.duplicate_score,
    status: "pending_review",
  } as never)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as { id?: string } | null)?.id ?? null;
}

export async function runJobFetchForSource(
  source: JobSourceRecord,
  trigger: FetchTriggerType = "manual",
  options?: {
    maxJobsPerSource?: number;
  },
): Promise<SourceRunResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  validateJobSource(source);
  const batchId = await createBatch(source.id);
  const counters: BatchCounters = {
    totalFound: 0,
    totalNew: 0,
    totalDuplicates: 0,
    totalFailed: 0,
  };

  logBatch(batchId, source, "batch_started", { trigger });

  try {
    const payload = await fetchSourcePayload(source);
    logBatch(batchId, source, "payload_fetched", {
      contentType: payload.contentType,
      status: payload.status,
      fetchedUrl: payload.fetchedUrl,
    });

    const extractedJobs = await extractRawJobsFromPayload(source, payload);
    const scopedJobs = filterJobsForSourceLocationScope(source, extractedJobs);
    const maxJobsPerSource =
      typeof options?.maxJobsPerSource === "number" && options.maxJobsPerSource > 0
        ? Math.trunc(options.maxJobsPerSource)
        : scopedJobs.length;
    const limitedJobs = scopedJobs.slice(0, maxJobsPerSource);
    counters.totalFound = limitedJobs.length;
    logBatch(batchId, source, "jobs_extracted", {
      totalExtracted: extractedJobs.length,
      totalMatchedScope: scopedJobs.length,
      totalFound: counters.totalFound,
    });

    if (scopedJobs.length === 0) {
      throw new FetcherError(
        "EMPTY_RESULT",
        `No jobs matched the configured location scope for source ${source.name}.`,
      );
    }

    if (scopedJobs.length > limitedJobs.length) {
      logBatch(batchId, source, "jobs_limited", {
        extractedCount: scopedJobs.length,
        processedCount: limitedJobs.length,
        maxJobsPerSource,
      });
    }

    for (const extractedJob of limitedJobs) {
      const contentHash = generateContentHash(extractedJob);
      const rawRow = await insertRawJob(source, batchId, contentHash, extractedJob);

      try {
        const duplicate = await findExistingRawDuplicate(admin, contentHash, rawRow.id);
        if (duplicate) {
          counters.totalDuplicates += 1;
          await updateRawJobStatus(rawRow.id, "duplicate");
          logBatch(batchId, source, "duplicate_detected", {
            rawJobId: rawRow.id,
            duplicateOfRawJobId: duplicate.id,
            errorCode: "DUPLICATE_RESULT",
          });
          continue;
        }

        const normalizedJob = normalizeRawJob({
          source,
          rawJob: extractedJob,
          rawRow,
        });
        const enrichedJob = await enrichNormalizedJob(normalizedJob);

        const normalizedJobId = await insertNormalizedJob(rawRow.id, enrichedJob);
        await updateRawJobStatus(rawRow.id, "parsed");
        counters.totalNew += 1;

        if (normalizedJobId && isAutoPublishEnabled()) {
          try {
            const outcome = await autoPublishNormalizedJob({
              normalizedJobId,
              job: enrichedJob,
              source,
            });
            if (outcome.published) {
              counters.totalPublished = (counters.totalPublished ?? 0) + 1;
              logBatch(batchId, source, "job_auto_published", {
                normalizedJobId,
                jobId: outcome.jobId,
                slug: outcome.slug,
              });
            } else {
              logBatch(batchId, source, "job_auto_publish_skipped", {
                normalizedJobId,
                reason: outcome.reason,
              });
            }
          } catch (publishError) {
            logBatch(batchId, source, "job_auto_publish_failed", {
              normalizedJobId,
              message: publishError instanceof Error ? publishError.message : "Unknown publish failure.",
            });
          }
        }
      } catch (error) {
        counters.totalFailed += 1;
        await updateRawJobStatus(rawRow.id, "failed");
        logBatch(batchId, source, "job_failed", {
          rawJobId: rawRow.id,
          message: error instanceof Error ? error.message : "Unknown job processing failure.",
        });
      }
    }

    const status = deriveBatchStatus(counters);
    const message =
      counters.totalFound > 0 && counters.totalDuplicates === counters.totalFound
        ? "All fetched jobs were duplicates."
        : null;

    await updateBatch(batchId, {
      status,
      counters,
      errorMessage: message,
    });
    await updateSourceTimestamps(source.id, {
      success: status !== "failed",
      message,
    });

    logBatch(batchId, source, "batch_completed", { status, ...counters });

    return {
      batchId,
      sourceId: source.id,
      sourceName: source.name,
      ok: status !== "failed",
      status,
      message: message ?? undefined,
      ...counters,
    };
  } catch (error) {
    const handledError =
      error instanceof FetcherError
        ? error
        : new FetcherError("PARSING_FAILURE", error instanceof Error ? error.message : "Unknown fetch failure.", error);

    await updateBatch(batchId, {
      status: "failed",
      counters,
      errorMessage: `${handledError.code}: ${handledError.message}`,
    });
    await updateSourceTimestamps(source.id, {
      success: false,
      message: `${handledError.code}: ${handledError.message}`,
    });

    logBatch(batchId, source, "batch_failed", {
      errorCode: handledError.code,
      message: handledError.message,
    });

    return {
      batchId,
      sourceId: source.id,
      sourceName: source.name,
      ok: false,
      status: "failed",
      message: `${handledError.code}: ${handledError.message}`,
      ...counters,
    };
  }
}
