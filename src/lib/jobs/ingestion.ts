import { createHash } from "crypto";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { syncGovernmentSource } from "@/lib/government-jobs/fetcher";
import { parseJobSourceConfig } from "@/lib/jobs/source-config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const BLOCKED_HOST_PATTERNS = [
  "linkedin.",
  "naukri.",
  "indeed.",
  "apna.",
  "glassdoor.",
];

const DEFAULT_USER_AGENT = "JobPulseIndiaBot/1.0 (+https://jobpulseindia.in)";

export type JobSourceType = "employer" | "official" | "partner";
export type JobSourceTransport =
  | "rss"
  | "api"
  | "csv"
  | "html"
  | "greenhouse"
  | "lever"
  | "workday"
  | "government";

export type JobSourceRow = {
  id: string;
  name: string;
  source_type: JobSourceType;
  transport_type: JobSourceTransport;
  source_url: string;
  status: "active" | "paused" | "archived";
  allow_auto_fetch: boolean;
  config: Record<string, unknown> | null;
  notes: string | null;
  last_fetched_at: string | null;
};

type ParsedFeedJob = {
  sourceJobKey?: string;
  title: string;
  companyName?: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  applicationUrl?: string;
  sourceUrl?: string;
  publishedAt?: string;
  deadline?: string;
  jobType?: string;
  workMode?: string;
  salaryType?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  educationRequired?: string;
  experienceRequired?: string;
  experienceMin?: number | null;
  experienceMax?: number | null;
  industry?: string;
  openings?: number;
  recruiterContact?: string;
  companyWebsite?: string;
  rawPayload?: Record<string, unknown>;
};

export type NormalizedFetchedJob = {
  sourceId: string;
  sourceJobKey: string | null;
  sourceType: JobSourceType;
  sourceUrl: string;
  applicationUrl: string | null;
  title: string;
  companyName: string;
  city: string;
  state: string;
  country: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  jobType: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "walk-in";
  workMode: "remote" | "hybrid" | "onsite";
  salaryType: "monthly" | "yearly" | "stipend";
  salaryMin: number;
  salaryMax: number;
  educationRequired: string;
  experienceRequired: string;
  experienceMin: number | null;
  experienceMax: number | null;
  industry: string;
  openings: number;
  deadline: string | null;
  recruiterContact: string | null;
  companyWebsite: string | null;
  dedupeFingerprint: string;
  rawPayload: Record<string, unknown>;
  normalizedPayload: Record<string, unknown>;
  enrichmentPayload: Record<string, unknown>;
};

function ensureAllowedSourceUrl(sourceUrl: string) {
  const parsed = new URL(sourceUrl);
  const host = parsed.hostname.toLowerCase();

  if (BLOCKED_HOST_PATTERNS.some((pattern) => host.includes(pattern))) {
    throw new Error("This source URL is blocked. JobPulse India only fetches from official or explicitly allowed sources.");
  }
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

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function toList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toInt(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number.parseInt(normalized, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }

  return fallback;
}

function normalizeJobType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("freelance")) return "freelance";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("walk")) return "walk-in";
  return "full-time";
}

function normalizeWorkMode(value: string) {
  const normalized = value.trim().toLowerCase();
  if (/\b(remote|wfh|work from home)\b/.test(normalized)) return "remote";
  if (/\b(hybrid)\b/.test(normalized)) return "hybrid";
  return "onsite";
}

function normalizeSalaryType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("month")) return "monthly";
  if (normalized.includes("stipend")) return "stipend";
  return "yearly";
}

function extractLocationParts(value: string) {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city: parts[0] ?? "India",
    state: parts[1] ?? (parts[0] ?? "India"),
    country: parts[2] ?? "India",
  };
}

function xmlValue(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function xmlValues(xml: string, tag: string) {
  return Array.from(xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))).map((match) =>
    stripHtml(match[1]),
  );
}

function getArrayCandidate(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["jobs", "items", "results", "openings", "positions", "data"]) {
      if (Array.isArray(record[key])) {
        return getArrayCandidate(record[key]);
      }
    }
  }

  return [];
}

function parseRssFeed(xml: string): ParsedFeedJob[] {
  const blocks = [
    ...Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]),
    ...Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((match) => match[0]),
  ];

  return blocks.map((block, index) => {
    const title = xmlValue(block, "title");
    const description = firstNonEmpty(xmlValue(block, "description"), xmlValue(block, "summary"), xmlValue(block, "content"));
    const link = firstNonEmpty(xmlValue(block, "link"), block.match(/<link[^>]*href="([^"]+)"/i)?.[1]);
    const companyName = firstNonEmpty(
      xmlValue(block, "author"),
      xmlValue(block, "company"),
      xmlValues(block, "category")[0],
    );

    return {
      sourceJobKey: firstNonEmpty(xmlValue(block, "guid"), link, `${index}`),
      title,
      description,
      applicationUrl: link,
      sourceUrl: link,
      companyName,
      rawPayload: {
        title,
        description,
        link,
      },
    };
  }).filter((item) => item.title);
}

function parseCsvFeed(text: string): ParsedFeedJob[] {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) return [];

  const headers = rows[0].split(",").map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((line, index) => {
    const columns = line.split(",").map((cell) => cell.trim());
    const record = headers.reduce<Record<string, string>>((acc, header, columnIndex) => {
      acc[header] = columns[columnIndex] ?? "";
      return acc;
    }, {});

    return {
      sourceJobKey: firstNonEmpty(record.id, record.job_id, record.slug, `${index}`),
      title: firstNonEmpty(record.title, record.role, record.position),
      companyName: firstNonEmpty(record.company, record.company_name),
      description: firstNonEmpty(record.description, record.summary),
      city: record.city,
      state: record.state,
      applicationUrl: firstNonEmpty(record.application_url, record.apply_url),
      sourceUrl: firstNonEmpty(record.source_url, record.url),
      rawPayload: record,
    };
  }).filter((item) => item.title);
}

function parseJsonFeed(payload: unknown): ParsedFeedJob[] {
  const entries = getArrayCandidate(payload);
  return entries.map((entry, index) => ({
    sourceJobKey: firstNonEmpty(
      typeof entry.id === "string" ? entry.id : undefined,
      typeof entry.requisition_id === "string" ? entry.requisition_id : undefined,
      typeof entry.slug === "string" ? entry.slug : undefined,
      `${index}`,
    ),
    title: firstNonEmpty(
      typeof entry.title === "string" ? entry.title : undefined,
      typeof entry.name === "string" ? entry.name : undefined,
      typeof entry.position === "string" ? entry.position : undefined,
    ),
    companyName: firstNonEmpty(
      typeof entry.company_name === "string" ? entry.company_name : undefined,
      typeof entry.company === "string" ? entry.company : undefined,
      typeof entry.organization === "string" ? entry.organization : undefined,
    ),
    description: firstNonEmpty(
      typeof entry.description === "string" ? entry.description : undefined,
      typeof entry.content === "string" ? entry.content : undefined,
      typeof entry.summary === "string" ? entry.summary : undefined,
    ),
    city: firstNonEmpty(
      typeof entry.city === "string" ? entry.city : undefined,
      typeof entry.location === "string" ? entry.location : undefined,
    ),
    state: typeof entry.state === "string" ? entry.state : undefined,
    applicationUrl: firstNonEmpty(
      typeof entry.application_url === "string" ? entry.application_url : undefined,
      typeof entry.apply_url === "string" ? entry.apply_url : undefined,
      typeof entry.absolute_url === "string" ? entry.absolute_url : undefined,
      typeof entry.url === "string" ? entry.url : undefined,
    ),
    sourceUrl: firstNonEmpty(
      typeof entry.source_url === "string" ? entry.source_url : undefined,
      typeof entry.url === "string" ? entry.url : undefined,
      typeof entry.absolute_url === "string" ? entry.absolute_url : undefined,
    ),
    publishedAt: typeof entry.updated_at === "string" ? entry.updated_at : undefined,
    deadline: typeof entry.deadline === "string" ? entry.deadline : undefined,
    jobType: typeof entry.job_type === "string" ? entry.job_type : undefined,
    workMode: typeof entry.work_mode === "string" ? entry.work_mode : undefined,
    salaryType: typeof entry.salary_type === "string" ? entry.salary_type : undefined,
    salaryMin: typeof entry.salary_min === "number" ? entry.salary_min : undefined,
    salaryMax: typeof entry.salary_max === "number" ? entry.salary_max : undefined,
    skills: toList(entry.skills),
    requirements: toList(entry.requirements),
    responsibilities: toList(entry.responsibilities),
    educationRequired: typeof entry.education_required === "string" ? entry.education_required : undefined,
    experienceRequired: typeof entry.experience_required === "string" ? entry.experience_required : undefined,
    companyWebsite: typeof entry.company_website === "string" ? entry.company_website : undefined,
    rawPayload: entry,
  })).filter((item) => item.title);
}

function parseHtmlFeed(html: string): ParsedFeedJob[] {
  const jobPostingBlocks = Array.from(
    html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  );

  const jobs: ParsedFeedJob[] = [];
  for (const block of jobPostingBlocks) {
    const content = block[1]?.trim();
    if (!content) continue;

    try {
      const parsed = JSON.parse(content) as Record<string, unknown> | Array<Record<string, unknown>>;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] !== "JobPosting") continue;
        const locationText =
          typeof item.jobLocation === "object" && item.jobLocation && "address" in item.jobLocation
            ? JSON.stringify(item.jobLocation)
            : "";

        jobs.push({
          sourceJobKey: typeof item.identifier === "string" ? item.identifier : undefined,
          title: typeof item.title === "string" ? item.title : "",
          companyName:
            typeof item.hiringOrganization === "object" &&
            item.hiringOrganization &&
            "name" in item.hiringOrganization &&
            typeof item.hiringOrganization.name === "string"
              ? item.hiringOrganization.name
              : undefined,
          description: typeof item.description === "string" ? item.description : undefined,
          city: locationText,
          applicationUrl: typeof item.url === "string" ? item.url : undefined,
          sourceUrl: typeof item.url === "string" ? item.url : undefined,
          deadline: typeof item.validThrough === "string" ? item.validThrough : undefined,
          employmentType: undefined,
          rawPayload: item,
        } as ParsedFeedJob);
      }
    } catch {
      continue;
    }
  }

  if (jobs.length > 0) return jobs;

  return Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi))
    .slice(0, 50)
    .map((match, index) => ({
      sourceJobKey: `${index}`,
      title: stripHtml(match[2]),
      applicationUrl: match[1],
      sourceUrl: match[1],
      rawPayload: { anchorHtml: match[0] },
    }))
    .filter((item) => item.title.length > 8);
}

function buildDedupeFingerprint(input: {
  title: string;
  companyName: string;
  city: string;
  state: string;
  sourceUrl: string;
}) {
  return createHash("sha256")
    .update(
      [
        input.title.toLowerCase(),
        input.companyName.toLowerCase(),
        input.city.toLowerCase(),
        input.state.toLowerCase(),
        input.sourceUrl.toLowerCase(),
      ].join("|"),
    )
    .digest("hex");
}

async function enrichJob(input: NormalizedFetchedJob) {
  const base = {
    summary: input.description.slice(0, 280),
    cleanTitle: input.title,
    suggestedSkills: input.skills,
    trustSignals: [
      input.sourceType === "official" ? "official_source" : null,
      input.applicationUrl ? "application_url_present" : null,
      input.companyWebsite ? "company_website_present" : null,
    ].filter(Boolean),
  };

  const aiResult = await generateStructuredAiResponse("jobMatcher", {
    job: {
      title: input.title,
      companyName: input.companyName,
      description: input.description,
      skills: input.skills,
      city: input.city,
      state: input.state,
    },
    instruction:
      "Return concise JSON with cleaned_title, summary, suggested_skills, trust_signals, and note. Do not invent facts.",
  });

  if (aiResult && typeof aiResult === "object") {
    return {
      ...base,
      ai: aiResult,
    };
  }

  return base;
}

function normalizeParsedJob(source: JobSourceRow, parsedJob: ParsedFeedJob): NormalizedFetchedJob {
  const sourceConfig = parseJobSourceConfig({
    sourceType: source.source_type,
    transportType: source.transport_type,
    config: source.config,
  });
  const location = extractLocationParts(
    firstNonEmpty(parsedJob.city, parsedJob.state, sourceConfig.defaultCity, sourceConfig.defaultState, "India"),
  );
  const sourceUrl = firstNonEmpty(parsedJob.sourceUrl, source.source_url);
  const applicationUrl = firstNonEmpty(parsedJob.applicationUrl, sourceUrl);
  const description = stripHtml(parsedJob.description ?? "");
  const title = firstNonEmpty(parsedJob.title, "Untitled role");
  const companyName = firstNonEmpty(parsedJob.companyName, sourceConfig.companyName, source.name);
  const skills = Array.from(new Set(toList(parsedJob.skills)));
  const responsibilities = Array.from(new Set(toList(parsedJob.responsibilities)));
  const requirements = Array.from(new Set(toList(parsedJob.requirements)));
  const salaryMin = toInt(parsedJob.salaryMin, 0);
  const salaryMax = Math.max(salaryMin, toInt(parsedJob.salaryMax, salaryMin));
  const jobType = normalizeJobType(parsedJob.jobType ?? description);
  const workMode = normalizeWorkMode(parsedJob.workMode ?? description);
  const salaryType = normalizeSalaryType(parsedJob.salaryType ?? "");

  return {
    sourceId: source.id,
    sourceJobKey: parsedJob.sourceJobKey ?? null,
    sourceType: source.source_type,
    sourceUrl,
    applicationUrl: applicationUrl || null,
    title,
    companyName,
    city: location.city,
    state: location.state,
    country: location.country,
    description,
    responsibilities,
    requirements,
    skills,
    jobType,
    workMode,
    salaryType,
    salaryMin,
    salaryMax,
    educationRequired: firstNonEmpty(parsedJob.educationRequired),
    experienceRequired: firstNonEmpty(parsedJob.experienceRequired),
    experienceMin: parsedJob.experienceMin ?? null,
    experienceMax: parsedJob.experienceMax ?? null,
    industry: firstNonEmpty(parsedJob.industry),
    openings: Math.max(1, toInt(parsedJob.openings, 1)),
    deadline: parsedJob.deadline ?? null,
    recruiterContact: firstNonEmpty(parsedJob.recruiterContact) || null,
    companyWebsite: firstNonEmpty(parsedJob.companyWebsite) || null,
    dedupeFingerprint: buildDedupeFingerprint({
      title,
      companyName,
      city: location.city,
      state: location.state,
      sourceUrl,
    }),
    rawPayload: parsedJob.rawPayload ?? {},
    normalizedPayload: {
      title,
      companyName,
      city: location.city,
      state: location.state,
      applicationUrl,
      sourceUrl,
      jobType,
      workMode,
      salaryType,
    },
    enrichmentPayload: {},
  };
}

async function fetchSourceBody(source: JobSourceRow) {
  ensureAllowedSourceUrl(source.source_url);

  const response = await fetch(source.source_url, {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "application/json, text/xml, application/xml, text/csv, text/html;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  return { contentType, text };
}

function parseSourceContent(source: JobSourceRow, contentType: string, text: string) {
  if (source.transport_type === "rss" || contentType.includes("xml") || text.includes("<rss")) {
    return parseRssFeed(text);
  }

  if (source.transport_type === "csv" || contentType.includes("csv")) {
    return parseCsvFeed(text);
  }

  if (
    source.transport_type === "api" ||
    source.transport_type === "greenhouse" ||
    source.transport_type === "lever" ||
    source.transport_type === "workday" ||
    contentType.includes("json")
  ) {
    try {
      return parseJsonFeed(JSON.parse(text));
    } catch {
      return [];
    }
  }

  return parseHtmlFeed(text);
}

export async function syncJobSource(source: JobSourceRow, triggerType: "manual" | "cron" | "api" = "manual") {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data: run, error: runError } = await admin
    .from("job_fetch_runs")
    .insert({
      source_id: source.id,
      trigger_type: triggerType,
      status: "running",
    } as never)
    .select("id")
    .maybeSingle();
  const runId = (run as { id?: string } | null)?.id ?? null;

  if (runError || !runId) {
    throw new Error(runError?.message ?? "Unable to create fetch run.");
  }

  try {
    if (source.transport_type === "government") {
      const result = await syncGovernmentSource(source);

      await admin
        .from("job_fetch_runs")
        .update({
          status: result.duplicateCount > 0 ? "partial" : "success",
          completed_at: new Date().toISOString(),
          fetched_count: result.fetchedCount,
          parsed_count: result.fetchedCount,
          pending_review_count: result.pendingReviewCount,
          duplicate_count: result.duplicateCount,
          meta: { transport: "government" },
        } as never)
        .eq("id", runId);

      await admin
        .from("job_sources")
        .update({ last_fetched_at: new Date().toISOString() } as never)
        .eq("id", source.id);

      return {
        runId,
        fetchedCount: result.fetchedCount,
        pendingReviewCount: result.pendingReviewCount,
        duplicateCount: result.duplicateCount,
      };
    }

    const { contentType, text } = await fetchSourceBody(source);
    const parsedJobs = parseSourceContent(source, contentType, text);
    let pendingReviewCount = 0;
    let duplicateCount = 0;

    for (const parsedJob of parsedJobs) {
      const normalizedJob = normalizeParsedJob(source, parsedJob);
      normalizedJob.enrichmentPayload = await enrichJob(normalizedJob);

      const { data: duplicateJob } = await admin
        .from("jobs")
        .select("id")
        .eq("source_url", normalizedJob.sourceUrl)
        .eq("title", normalizedJob.title)
        .eq("company_name", normalizedJob.companyName)
        .maybeSingle();
      const duplicateJobId = (duplicateJob as { id?: string } | null)?.id ?? null;

      const { data: duplicateIngestion } = await admin
        .from("job_ingestion_items")
        .select("id, review_status")
        .eq("dedupe_fingerprint", normalizedJob.dedupeFingerprint)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const duplicateIngestionId = (duplicateIngestion as { id?: string } | null)?.id ?? null;

      const dedupeStatus = duplicateJobId
        ? "duplicate_existing_job"
        : duplicateIngestionId
          ? "duplicate_ingestion_item"
          : "new";

      const reviewStatus =
        dedupeStatus === "new" ? "pending_review" : "pending_review";

      await admin.from("job_ingestion_items").upsert(
        {
          source_id: source.id,
          fetch_run_id: runId,
          source_job_key: normalizedJob.sourceJobKey,
          source_type: normalizedJob.sourceType,
          source_url: normalizedJob.sourceUrl,
          application_url: normalizedJob.applicationUrl,
          title: normalizedJob.title,
          company_name: normalizedJob.companyName,
          city: normalizedJob.city,
          state: normalizedJob.state,
          country: normalizedJob.country,
          description: normalizedJob.description,
          responsibilities: normalizedJob.responsibilities,
          requirements: normalizedJob.requirements,
          skills: normalizedJob.skills,
          job_type: normalizedJob.jobType,
          work_mode: normalizedJob.workMode,
          salary_type: normalizedJob.salaryType,
          salary_min: normalizedJob.salaryMin,
          salary_max: normalizedJob.salaryMax,
          education_required: normalizedJob.educationRequired || null,
          experience_required: normalizedJob.experienceRequired || null,
          experience_min: normalizedJob.experienceMin,
          experience_max: normalizedJob.experienceMax,
          industry: normalizedJob.industry || null,
          openings: normalizedJob.openings,
          deadline: normalizedJob.deadline,
          recruiter_contact: normalizedJob.recruiterContact,
          company_website: normalizedJob.companyWebsite,
          raw_payload: normalizedJob.rawPayload,
          normalized_payload: normalizedJob.normalizedPayload,
          enrichment_payload: normalizedJob.enrichmentPayload,
          dedupe_fingerprint: normalizedJob.dedupeFingerprint,
          dedupe_status: dedupeStatus,
          duplicate_of_job_id: duplicateJobId,
          duplicate_of_ingestion_item_id: duplicateIngestionId,
          review_status: reviewStatus,
        } as never,
        {
          onConflict: "source_id,source_job_key",
        },
      );

      if (dedupeStatus === "new") {
        pendingReviewCount += 1;
      } else {
        duplicateCount += 1;
      }
    }

    await admin
      .from("job_fetch_runs")
      .update({
        status: duplicateCount > 0 ? "partial" : "success",
        completed_at: new Date().toISOString(),
        fetched_count: parsedJobs.length,
        parsed_count: parsedJobs.length,
        pending_review_count: pendingReviewCount,
        duplicate_count: duplicateCount,
        meta: { contentType },
      } as never)
      .eq("id", runId);

    await admin
      .from("job_sources")
      .update({ last_fetched_at: new Date().toISOString() } as never)
      .eq("id", source.id);

    return {
      runId,
      fetchedCount: parsedJobs.length,
      pendingReviewCount,
      duplicateCount,
    };
  } catch (error) {
    await admin
      .from("job_fetch_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : "Unknown fetch failure.",
      } as never)
      .eq("id", runId);

    throw error;
  }
}

export async function syncAutoFetchSources() {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await admin
    .from("job_sources")
    .select("id, name, source_type, transport_type, source_url, status, allow_auto_fetch, config, notes, last_fetched_at")
    .eq("status", "active")
    .eq("allow_auto_fetch", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const results = [];
  for (const source of (data ?? []) as JobSourceRow[]) {
    const sourceConfig = parseJobSourceConfig({
      sourceType: source.source_type,
      transportType: source.transport_type,
      config: source.config,
    });
    if (source.last_fetched_at) {
      const lastFetchedAt = new Date(source.last_fetched_at).getTime();
      const nextEligibleAt = lastFetchedAt + sourceConfig.fetchFrequencyMinutes * 60 * 1000;
      if (Number.isFinite(lastFetchedAt) && nextEligibleAt > Date.now()) {
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          ok: true,
          skipped: true,
          reason: `Next eligible fetch after ${new Date(nextEligibleAt).toISOString()}.`,
        });
        continue;
      }
    }

    try {
      const result = await syncJobSource(source, "cron");
      results.push({ sourceId: source.id, sourceName: source.name, ok: true, ...result });
    } catch (error) {
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        ok: false,
        message: error instanceof Error ? error.message : "Unknown fetch error.",
      });
    }
  }

  return results;
}

export function assertAllowedJobSourceUrl(sourceUrl: string) {
  ensureAllowedSourceUrl(sourceUrl);
}
