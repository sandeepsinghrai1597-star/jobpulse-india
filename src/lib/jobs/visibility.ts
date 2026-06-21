import type { Job } from "@/types";

const INDIA_TIME_ZONE = "Asia/Kolkata";
const INDIA_UTC_OFFSET = "+05:30";

type VisibilityCandidate = {
  status?: string | null;
  deadline?: string | null;
  expires_at?: string | null;
};

type VisibleJob = Job & {
  expiresAt?: string | null;
};

function formatIndiaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function normalizeDateString(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getPublicJobWindow(now = new Date()) {
  const todayDate = formatIndiaDate(now);
  const todayStartIso = `${todayDate}T00:00:00.000${INDIA_UTC_OFFSET}`;
  const todayStartTimestamp = Date.parse(todayStartIso);

  return {
    todayDate,
    todayStartIso,
    todayStartTimestamp,
  };
}

export function isPublicJobVisible(candidate: VisibilityCandidate, now = new Date()) {
  if (candidate.status !== "active") {
    return false;
  }

  const { todayDate, todayStartTimestamp } = getPublicJobWindow(now);
  const deadline = normalizeDateString(candidate.deadline);
  const expiresAtTimestamp = parseTimestamp(candidate.expires_at);
  const deadlineOk = deadline === null || deadline >= todayDate;
  const expiresOk = expiresAtTimestamp === null || expiresAtTimestamp >= todayStartTimestamp;

  return deadlineOk && expiresOk;
}

export function filterVisibleJobRows<T extends VisibilityCandidate>(rows: T[], now = new Date()) {
  return rows.filter((row) => isPublicJobVisible(row, now));
}

export function isPublicJobObjectVisible(job: VisibleJob, now = new Date()) {
  return isPublicJobVisible(
    {
      status: job.status,
      deadline: job.applicationDeadline,
      expires_at: job.expiresAt ?? null,
    },
    now,
  );
}

export function filterVisibleJobs<T extends VisibleJob>(jobs: T[], now = new Date()) {
  return jobs.filter((job) => isPublicJobObjectVisible(job, now));
}
