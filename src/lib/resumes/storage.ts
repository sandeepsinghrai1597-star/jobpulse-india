import { randomUUID } from "crypto";

export const RESUME_BUCKET = "candidate-resumes";
export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const RESUME_SIGNED_URL_TTL_SECONDS = 60;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const SAFE_FILE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._ -]{0,119}$/;

export function isAllowedResumeMimeType(value: string) {
  return ALLOWED_RESUME_MIME_TYPES.includes(
    value as (typeof ALLOWED_RESUME_MIME_TYPES)[number],
  );
}

export function isSafeResumeFileName(fileName: string) {
  const trimmed = fileName.trim();

  if (!trimmed) return false;
  if (trimmed.startsWith(".")) return false;
  if (trimmed.includes("..")) return false;
  if (/[\\/\u0000-\u001F]/.test(trimmed)) return false;

  return SAFE_FILE_NAME_PATTERN.test(trimmed);
}

export function sanitizeResumeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export function buildResumeStoragePath(userId: string, fileName: string) {
  return `${userId}/${randomUUID()}-${sanitizeResumeFileName(fileName)}`;
}

export function buildResumeDownloadHref(params: { resumeId?: string; applicationId?: string }) {
  const searchParams = new URLSearchParams();

  if (params.resumeId) {
    searchParams.set("resumeId", params.resumeId);
  }

  if (params.applicationId) {
    searchParams.set("applicationId", params.applicationId);
  }

  return `/api/resumes/download?${searchParams.toString()}`;
}
