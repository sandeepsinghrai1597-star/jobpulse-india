export type FetchTriggerType = "manual" | "cron" | "api";

export type SupportedTransportType =
  | "rss"
  | "api"
  | "csv"
  | "html"
  | "greenhouse"
  | "lever"
  | "workday"
  | "government";

export type SourceStatus = "active" | "paused" | "archived";

export type InternalSourceType =
  | "employer"
  | "admin"
  | "official"
  | "partner"
  | "company_career_page"
  | "government_source"
  | "rss_feed"
  | "api_feed"
  | "csv_upload"
  | "employer_feed";

export type NormalizedSourceType =
  | "company_career_page"
  | "government_source"
  | "rss_feed"
  | "api_feed"
  | "csv_upload"
  | "employer_feed";

export type JobSourceRecord = {
  id: string;
  name: string;
  source_type: InternalSourceType | string;
  transport_type: SupportedTransportType | string;
  source_url: string;
  status: SourceStatus;
  allow_auto_fetch: boolean;
  config: Record<string, unknown> | null;
  notes: string | null;
  last_fetched_at: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
  is_active?: boolean | null;
};

export type SourcePayload = {
  contentType: string;
  body: string;
  fetchedUrl: string;
  status: number;
};

export type ExtractedRawJob = {
  raw_title: string | null;
  raw_company: string | null;
  raw_location: string | null;
  raw_description: string | null;
  raw_apply_url: string | null;
  raw_salary: string | null;
  raw_experience: string | null;
  raw_job_type: string | null;
  raw_posted_date: string | null;
  raw_deadline: string | null;
  raw_data_json: Record<string, unknown>;
};

export type RawFetchedJobRow = {
  id: string;
  source_id: string;
  content_hash: string;
  raw_title: string | null;
  raw_company: string | null;
  raw_location: string | null;
  raw_description: string | null;
  raw_apply_url: string | null;
  raw_salary: string | null;
  raw_experience: string | null;
  raw_job_type: string | null;
  raw_posted_date: string | null;
  raw_deadline: string | null;
  raw_data_json: Record<string, unknown>;
  fetch_batch_id: string | null;
  status: "new" | "duplicate" | "parsed" | "failed";
};

export type NormalizedJobDraft = {
  title: string;
  company_name: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_type: "monthly" | "yearly" | "stipend" | null;
  city: string | null;
  state: string | null;
  country: string;
  job_type:
    | "full-time"
    | "part-time"
    | "contract"
    | "freelance"
    | "internship"
    | "walk-in"
    | null;
  work_mode: "remote" | "hybrid" | "onsite" | null;
  experience_min: number | null;
  experience_max: number | null;
  education_required: string | null;
  industry: string | null;
  openings: number;
  deadline: string | null;
  apply_url: string | null;
  source_url: string;
  source_type: NormalizedSourceType;
  quality_score: number;
  duplicate_score: number;
  slug?: string;
  enrichment_notes?: string[];
};

export type BatchLogStatus = "running" | "success" | "partial_failed" | "failed";

export type BatchCounters = {
  totalFound: number;
  totalNew: number;
  totalDuplicates: number;
  totalFailed: number;
  totalPublished?: number;
};

export type SourceRunResult = BatchCounters & {
  batchId: string;
  sourceId: string;
  sourceName: string;
  ok: boolean;
  skipped?: boolean;
  status: BatchLogStatus;
  message?: string;
};

export type SchedulerResult = SourceRunResult[];

export type FetcherErrorCode =
  | "TIMEOUT"
  | "INVALID_SOURCE"
  | "EMPTY_RESULT"
  | "PARSING_FAILURE"
  | "DUPLICATE_RESULT"
  | "NETWORK_FAILURE";

export class FetcherError extends Error {
  code: FetcherErrorCode;
  cause?: unknown;

  constructor(code: FetcherErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "FetcherError";
    this.code = code;
    this.cause = cause;
  }
}
