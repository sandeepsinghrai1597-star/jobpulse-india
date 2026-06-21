export const JOB_SOURCE_TYPE_OPTIONS = [
  { value: "company-career-page", label: "Company career page" },
  { value: "government-source", label: "Government source" },
  { value: "rss-feed", label: "RSS feed" },
  { value: "api-feed", label: "API feed" },
  { value: "csv-upload", label: "CSV upload" },
  { value: "employer-feed", label: "Employer feed" },
] as const;

export const JOB_SOURCE_FETCH_METHOD_OPTIONS = [
  { value: "html", label: "HTML page" },
  { value: "rss", label: "RSS / Atom" },
  { value: "api", label: "API / JSON" },
  { value: "csv", label: "CSV feed" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever", label: "Lever" },
  { value: "workday", label: "Workday" },
  { value: "government", label: "Government feed" },
] as const;

export const JOB_SOURCE_FREQUENCY_OPTIONS = [
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
  { value: 180, label: "Every 3 hours" },
  { value: 360, label: "Every 6 hours" },
  { value: 720, label: "Every 12 hours" },
  { value: 1440, label: "Daily" },
  { value: 2880, label: "Every 2 days" },
  { value: 10080, label: "Weekly" },
] as const;

export type JobSourceUiType = (typeof JOB_SOURCE_TYPE_OPTIONS)[number]["value"];
export type JobSourceFetchMethod = (typeof JOB_SOURCE_FETCH_METHOD_OPTIONS)[number]["value"];

export type JobSourceConfigShape = {
  sourceType?: JobSourceUiType;
  companyName?: string | null;
  industry?: string | null;
  defaultCity?: string | null;
  defaultState?: string | null;
  coverageRegion?: string | null;
  locationKeywords?: string[] | string | null;
  allowedDetailDomains?: string[] | string | null;
  fetchFrequencyMinutes?: number;
};

const DEFAULT_FREQUENCY_MINUTES = 1440;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function normalizeDomainList(value: unknown) {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((entry) => (typeof entry === "string" ? normalizeDomain(entry) : ""))
          .filter(Boolean),
      ),
    );
  }

  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(/[\n,|]/)
          .map((entry) => normalizeDomain(entry))
          .filter(Boolean),
      ),
    );
  }

  return [];
}

function normalizeStringList(value: unknown) {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((entry) => (typeof entry === "string" ? entry.trim().toLowerCase() : ""))
          .filter(Boolean),
      ),
    );
  }

  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(/[\n,|]/)
          .map((entry) => entry.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
  }

  return [];
}

export function inferUiSourceType(input: {
  sourceType?: string | null;
  transportType?: string | null;
  config?: unknown;
}): JobSourceUiType {
  const config = isRecord(input.config) ? input.config : null;
  const configured = typeof config?.sourceType === "string" ? config.sourceType : null;

  if (configured && JOB_SOURCE_TYPE_OPTIONS.some((option) => option.value === configured)) {
    return configured as JobSourceUiType;
  }

  if (input.transportType === "government" || input.sourceType === "official") {
    return "government-source";
  }

  if (input.transportType === "rss") {
    return "rss-feed";
  }

  if (input.transportType === "api") {
    return "api-feed";
  }

  if (input.transportType === "csv") {
    return "csv-upload";
  }

  if (input.transportType === "greenhouse" || input.transportType === "lever" || input.transportType === "workday") {
    return "employer-feed";
  }

  if (input.sourceType === "employer") {
    return "company-career-page";
  }

  return "company-career-page";
}

export function inferInternalSourceType(sourceType: JobSourceUiType) {
  switch (sourceType) {
    case "government-source":
      return "official";
    case "company-career-page":
    case "employer-feed":
      return "employer";
    case "rss-feed":
    case "api-feed":
    case "csv-upload":
    default:
      return "partner";
  }
}

export function inferFetchMethod(sourceType: JobSourceUiType): JobSourceFetchMethod {
  switch (sourceType) {
    case "government-source":
      return "government";
    case "rss-feed":
      return "rss";
    case "api-feed":
      return "api";
    case "csv-upload":
      return "csv";
    case "employer-feed":
      return "greenhouse";
    case "company-career-page":
    default:
      return "html";
  }
}

export function parseJobSourceConfig(input: {
  sourceType?: string | null;
  transportType?: string | null;
  config?: unknown;
}) {
  const config = isRecord(input.config) ? input.config : {};
  const fetchFrequencyMinutesRaw =
    typeof config.fetchFrequencyMinutes === "number"
      ? config.fetchFrequencyMinutes
      : typeof config.fetchFrequencyMinutes === "string"
        ? Number.parseInt(config.fetchFrequencyMinutes, 10)
        : NaN;

  const fetchFrequencyMinutes =
    Number.isFinite(fetchFrequencyMinutesRaw) && fetchFrequencyMinutesRaw > 0
      ? Math.min(10080, Math.max(15, Math.trunc(fetchFrequencyMinutesRaw)))
      : DEFAULT_FREQUENCY_MINUTES;

  return {
    sourceType: inferUiSourceType(input),
    companyName: normalizeString(config.companyName),
    industry: normalizeString(config.industry),
    defaultCity: normalizeString(config.defaultCity),
    defaultState: normalizeString(config.defaultState),
    coverageRegion: normalizeString(config.coverageRegion),
    locationKeywords: normalizeStringList(config.locationKeywords),
    allowedDetailDomains: normalizeDomainList(config.allowedDetailDomains),
    fetchFrequencyMinutes,
  };
}

export function buildJobSourceConfig(input: JobSourceConfigShape) {
  return {
    sourceType: input.sourceType,
    companyName: input.companyName?.trim() || null,
    industry: input.industry?.trim() || null,
    defaultCity: input.defaultCity?.trim() || null,
    defaultState: input.defaultState?.trim() || null,
    coverageRegion: input.coverageRegion?.trim() || null,
    locationKeywords:
      Array.isArray(input.locationKeywords)
        ? Array.from(new Set(input.locationKeywords.map((keyword) => keyword.trim()).filter(Boolean)))
        : typeof input.locationKeywords === "string"
          ? Array.from(
              new Set(
                input.locationKeywords
                  .split(/[\n,|]/)
                  .map((keyword) => keyword.trim())
                  .filter(Boolean),
              ),
            )
          : [],
    allowedDetailDomains: normalizeDomainList(input.allowedDetailDomains),
    fetchFrequencyMinutes:
      typeof input.fetchFrequencyMinutes === "number" && Number.isFinite(input.fetchFrequencyMinutes)
        ? Math.min(10080, Math.max(15, Math.trunc(input.fetchFrequencyMinutes)))
        : DEFAULT_FREQUENCY_MINUTES,
  };
}

export function formatFrequencyLabel(minutes: number) {
  const exact = JOB_SOURCE_FREQUENCY_OPTIONS.find((option) => option.value === minutes);
  if (exact) return exact.label;
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "Daily" : `Every ${days} days`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "Every hour" : `Every ${hours} hours`;
  }
  return `Every ${minutes} minutes`;
}
