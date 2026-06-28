import { parseJobSourceConfig } from "@/lib/jobs/source-config";
import {
  getImportValidationWarnings,
  sanitizeImportedLocation,
  sanitizeImportedUrl,
} from "@/lib/jobs/import-validation";
import type {
  ExtractedRawJob,
  JobSourceRecord,
  NormalizedJobDraft,
  NormalizedSourceType,
  RawFetchedJobRow,
} from "@/server/job-fetcher/types";

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function stripHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueList(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function extractLocation(value: string, defaults: { city: string | null; state: string | null }) {
  const parts = value
    .replace(/[{}[\]"]/g, " ")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] ?? defaults.city ?? "India",
    state: parts[1] ?? defaults.state ?? (parts[0] ?? "India"),
    country: "India",
  };
}

function parseInteger(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const match = value.match(/-?\d+/);
    if (match) {
      return Number.parseInt(match[0], 10);
    }
  }

  return null;
}

function parseRange(value: string | null | undefined) {
  if (!value) {
    return { min: null, max: null };
  }

  const matches = value.match(/\d+/g)?.map((entry) => Number.parseInt(entry, 10)) ?? [];
  if (matches.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: matches[0] ?? null,
    max: matches[1] ?? matches[0] ?? null,
  };
}

function normalizeJobType(value: string): NormalizedJobDraft["job_type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("freelance")) return "freelance";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("walk")) return "walk-in";
  return "full-time";
}

function normalizeWorkMode(value: string): NormalizedJobDraft["work_mode"] {
  const normalized = value.toLowerCase();
  if (/\b(remote|wfh|work from home)\b/.test(normalized)) return "remote";
  if (/\bhybrid\b/.test(normalized)) return "hybrid";
  return "onsite";
}

function normalizeSalaryType(value: string): NormalizedJobDraft["salary_type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("month")) return "monthly";
  if (normalized.includes("stipend")) return "stipend";
  return "yearly";
}

function toNormalizedSourceType(source: JobSourceRecord): NormalizedSourceType {
  const rawTransport = String(source.transport_type ?? "").toLowerCase();
  const rawSourceType = String(source.source_type ?? "").toLowerCase();

  if (rawTransport === "government" || rawSourceType === "official" || rawSourceType === "government_source") {
    return "government_source";
  }

  if (rawTransport === "rss" || rawSourceType === "rss_feed") {
    return "rss_feed";
  }

  if (rawTransport === "api" || rawSourceType === "api_feed") {
    return "api_feed";
  }

  if (rawTransport === "csv" || rawSourceType === "csv_upload") {
    return "csv_upload";
  }

  if (["greenhouse", "lever", "workday"].includes(rawTransport) || rawSourceType === "employer_feed") {
    return "employer_feed";
  }

  return "company_career_page";
}

function computeQualityScore(draft: Omit<NormalizedJobDraft, "quality_score" | "duplicate_score">) {
  let score = 40;
  if (draft.description.length >= 80) score += 15;
  if (draft.skills.length > 0) score += 10;
  if (draft.apply_url) score += 10;
  if (draft.city || draft.state) score += 10;
  if (draft.company_name) score += 10;
  if (draft.deadline) score += 5;
  return Math.min(100, score);
}

export function normalizeRawJob(input: {
  source: JobSourceRecord;
  rawJob: ExtractedRawJob;
  rawRow?: RawFetchedJobRow;
}) {
  const sourceConfig = parseJobSourceConfig({
    sourceType: input.source.source_type,
    transportType: input.source.transport_type,
    config: input.source.config,
  });
  const location = extractLocation(firstNonEmpty(input.rawJob.raw_location, sourceConfig.defaultCity, sourceConfig.defaultState), {
    city: sourceConfig.defaultCity,
    state: sourceConfig.defaultState,
  });
  const description = stripHtml(input.rawJob.raw_description ?? "");
  const salaryRange = parseRange(input.rawJob.raw_salary);
  const experienceRange = parseRange(input.rawJob.raw_experience);
  const rawSourceUrl =
    firstNonEmpty(
      typeof input.rawJob.raw_data_json.sourceUrl === "string" ? input.rawJob.raw_data_json.sourceUrl : undefined,
      typeof input.rawJob.raw_data_json.url === "string" ? input.rawJob.raw_data_json.url : undefined,
      input.source.source_url,
    ) || input.source.source_url;
  const sourceUrl = sanitizeImportedUrl(rawSourceUrl) ?? input.source.source_url;
  const applyUrl = sanitizeImportedUrl(firstNonEmpty(input.rawJob.raw_apply_url, sourceUrl));
  const city = sanitizeImportedLocation(location.city) ?? sourceConfig.defaultCity ?? "India";
  const state = sanitizeImportedLocation(location.state) ?? sourceConfig.defaultState ?? city;
  const responsibilities = uniqueList(
    Array.isArray(input.rawJob.raw_data_json.responsibilities)
      ? (input.rawJob.raw_data_json.responsibilities as unknown[]).map(String)
      : [],
  );
  const requirements = uniqueList(
    Array.isArray(input.rawJob.raw_data_json.requirements)
      ? (input.rawJob.raw_data_json.requirements as unknown[]).map(String)
      : [],
  );
  const skills = uniqueList(
    Array.isArray(input.rawJob.raw_data_json.skills)
      ? (input.rawJob.raw_data_json.skills as unknown[]).map(String)
      : [],
  );

  const draftBase = {
    title: firstNonEmpty(input.rawJob.raw_title, "Untitled role") || "Untitled role",
    company_name: firstNonEmpty(input.rawJob.raw_company, sourceConfig.companyName, input.source.name) || input.source.name,
    description,
    responsibilities,
    requirements,
    skills,
    salary_min: salaryRange.min,
    salary_max: salaryRange.max,
    salary_type: input.rawJob.raw_salary ? normalizeSalaryType(input.rawJob.raw_salary) : null,
    city,
    state,
    country: "India",
    job_type: input.rawJob.raw_job_type ? normalizeJobType(input.rawJob.raw_job_type) : null,
    work_mode: description ? normalizeWorkMode(description) : null,
    experience_min: experienceRange.min ?? parseInteger(input.rawJob.raw_data_json.experience_min as string | number | null | undefined),
    experience_max: experienceRange.max ?? parseInteger(input.rawJob.raw_data_json.experience_max as string | number | null | undefined),
    education_required:
      firstNonEmpty(
        typeof input.rawJob.raw_data_json.education_required === "string"
          ? input.rawJob.raw_data_json.education_required
          : undefined,
      ) || null,
    industry:
      firstNonEmpty(
        typeof input.rawJob.raw_data_json.industry === "string" ? input.rawJob.raw_data_json.industry : undefined,
        sourceConfig.industry,
      ) || null,
    openings: Math.max(1, parseInteger(input.rawJob.raw_data_json.openings as string | number | null | undefined) ?? 1),
    deadline: firstNonEmpty(input.rawJob.raw_deadline) || null,
    apply_url: applyUrl,
    source_url: sourceUrl,
    source_type: toNormalizedSourceType(input.source),
    slug: "",
    enrichment_notes: getImportValidationWarnings({
      title: firstNonEmpty(input.rawJob.raw_title, "Untitled role"),
      applyUrl: input.rawJob.raw_apply_url,
      sourceUrl: rawSourceUrl,
      city: location.city,
      state: location.state,
    }),
  };

  return {
    ...draftBase,
    quality_score: computeQualityScore(draftBase),
    duplicate_score: 0,
  } satisfies NormalizedJobDraft;
}
