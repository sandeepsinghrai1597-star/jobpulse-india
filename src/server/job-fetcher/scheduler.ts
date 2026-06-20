import { parseJobSourceConfig } from "@/lib/jobs/source-config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { runJobFetchForSource } from "@/server/job-fetcher/fetcher";
import type { FetchTriggerType, JobSourceRecord, SchedulerResult, SourceRunResult } from "@/server/job-fetcher/types";

const DEFAULT_MAX_JOBS_PER_SOURCE = 25;
const DEFAULT_PER_SOURCE_TIMEOUT_MS = 20_000;
const DEFAULT_SCHEDULER_TIMEOUT_MS = 50_000;
const DEFAULT_FAILURE_STREAK_LIMIT = 3;
const DEFAULT_FAILURE_COOLDOWN_MINUTES = 720;

export type JobFetchSchedulerOptions = {
  autoOnly?: boolean;
  sourceId?: string;
  maxJobsPerSource?: number;
  perSourceTimeoutMs?: number;
  schedulerTimeoutMs?: number;
  consecutiveFailureLimit?: number;
  failureCooldownMinutes?: number;
};

function resolvePositiveInteger(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

function shouldFetchSource(source: JobSourceRecord) {
  const sourceConfig = parseJobSourceConfig({
    sourceType: source.source_type,
    transportType: source.transport_type,
    config: source.config,
  });

  if (!source.last_fetched_at) {
    return true;
  }

  const lastFetchedAt = new Date(source.last_fetched_at).getTime();
  if (!Number.isFinite(lastFetchedAt)) {
    return true;
  }

  return lastFetchedAt + sourceConfig.fetchFrequencyMinutes * 60 * 1000 <= Date.now();
}

async function getRecentFailureState(sourceId: string, streakLimit: number) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await admin
    .from("job_fetch_batches")
    .select("status, finished_at, started_at")
    .eq("source_id", sourceId)
    .order("started_at", { ascending: false })
    .limit(streakLimit);

  if (error) {
    throw new Error(error.message);
  }

  const batches = (data ?? []) as Array<{
    status: "running" | "success" | "partial_failed" | "failed";
    finished_at: string | null;
    started_at: string;
  }>;

  let consecutiveFailures = 0;
  for (const batch of batches) {
    if (batch.status === "failed") {
      consecutiveFailures += 1;
      continue;
    }

    break;
  }

  return {
    consecutiveFailures,
    latestFinishedAt: batches[0]?.finished_at ?? batches[0]?.started_at ?? null,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutHandle: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  });
}

export async function loadEligibleJobSources(options?: {
  sourceId?: string;
  autoOnly?: boolean;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  let query = admin
    .from("job_sources")
    .select(
      "id, name, source_type, transport_type, source_url, status, allow_auto_fetch, config, notes, last_fetched_at, last_success_at, last_error",
    )
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (options?.autoOnly) {
    query = query.eq("allow_auto_fetch", true);
  }

  if (options?.sourceId) {
    query = query.eq("id", options.sourceId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JobSourceRecord[];
}

export async function runJobFetchScheduler(
  trigger: FetchTriggerType = "cron",
  options?: JobFetchSchedulerOptions,
): Promise<SchedulerResult> {
  const autoOnly = options?.autoOnly ?? trigger === "cron";
  const maxJobsPerSource = resolvePositiveInteger(options?.maxJobsPerSource, DEFAULT_MAX_JOBS_PER_SOURCE);
  const perSourceTimeoutMs = resolvePositiveInteger(options?.perSourceTimeoutMs, DEFAULT_PER_SOURCE_TIMEOUT_MS);
  const schedulerTimeoutMs = resolvePositiveInteger(options?.schedulerTimeoutMs, DEFAULT_SCHEDULER_TIMEOUT_MS);
  const consecutiveFailureLimit = resolvePositiveInteger(
    options?.consecutiveFailureLimit,
    DEFAULT_FAILURE_STREAK_LIMIT,
  );
  const failureCooldownMinutes = resolvePositiveInteger(
    options?.failureCooldownMinutes,
    DEFAULT_FAILURE_COOLDOWN_MINUTES,
  );

  const sources = await loadEligibleJobSources({
    autoOnly,
    sourceId: options?.sourceId,
  });
  const results: SourceRunResult[] = [];
  const deadline = Date.now() + schedulerTimeoutMs;

  for (const source of sources) {
    if (Date.now() >= deadline) {
      results.push({
        batchId: "",
        sourceId: source.id,
        sourceName: source.name,
        ok: true,
        skipped: true,
        status: "success",
        message: "Skipped because the scheduler deadline was reached before this source could start.",
        totalFound: 0,
        totalNew: 0,
        totalDuplicates: 0,
        totalFailed: 0,
      });
      continue;
    }

    if (!shouldFetchSource(source)) {
      results.push({
        batchId: "",
        sourceId: source.id,
        sourceName: source.name,
        ok: true,
        skipped: true,
        status: "success",
        message: "Skipped because the source is not yet due for its next fetch window.",
        totalFound: 0,
        totalNew: 0,
        totalDuplicates: 0,
        totalFailed: 0,
      });
      continue;
    }

    const failureState = await getRecentFailureState(source.id, consecutiveFailureLimit);
    if (failureState.consecutiveFailures >= consecutiveFailureLimit) {
      const latestFailureAt = failureState.latestFinishedAt ? new Date(failureState.latestFinishedAt).getTime() : NaN;
      const cooldownUntil = Number.isFinite(latestFailureAt)
        ? latestFailureAt + failureCooldownMinutes * 60 * 1000
        : NaN;

      if (!Number.isFinite(cooldownUntil) || cooldownUntil > Date.now()) {
        results.push({
          batchId: "",
          sourceId: source.id,
          sourceName: source.name,
          ok: true,
          skipped: true,
          status: "success",
          message: `Skipped after ${failureState.consecutiveFailures} consecutive failures. Cooldown is still active.`,
          totalFound: 0,
          totalNew: 0,
          totalDuplicates: 0,
          totalFailed: 0,
        });
        continue;
      }
    }

    try {
      const remainingMs = Math.max(1_000, deadline - Date.now());
      const timeoutMs = Math.min(perSourceTimeoutMs, remainingMs);
      const result = await withTimeout(
        runJobFetchForSource(source, trigger, { maxJobsPerSource }),
        timeoutMs,
        `Source fetch exceeded ${timeoutMs}ms timeout.`,
      );
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown scheduler failure.";
      console.error("[job-fetcher:scheduler]", JSON.stringify({
        sourceId: source.id,
        sourceName: source.name,
        trigger,
        message,
      }));

      results.push({
        batchId: "",
        sourceId: source.id,
        sourceName: source.name,
        ok: false,
        status: "failed",
        message,
        totalFound: 0,
        totalNew: 0,
        totalDuplicates: 0,
        totalFailed: 1,
      });
    }
  }

  return results;
}

export async function runSingleJobFetch(sourceId: string, trigger: FetchTriggerType = "manual") {
  const [source] = await loadEligibleJobSources({ sourceId, autoOnly: false });
  if (!source) {
    throw new Error(`No active job source found for ${sourceId}.`);
  }

  return runJobFetchForSource(source, trigger, {
    maxJobsPerSource: DEFAULT_MAX_JOBS_PER_SOURCE,
  });
}
