import { parseJobSourceConfig } from "@/lib/jobs/source-config";
import { FetcherError, type JobSourceRecord, type SourcePayload, type SupportedTransportType } from "@/server/job-fetcher/types";

export const DEFAULT_FETCH_TIMEOUT_MS = 20_000;
export const DEFAULT_USER_AGENT = "JobPulseIndiaBot/2.0 (+https://jobpulseindia.in)";
export const BLOCKED_HOST_PATTERNS = ["linkedin.", "naukri.", "indeed.", "apna.", "glassdoor."];

const SUPPORTED_TRANSPORTS = new Set<SupportedTransportType>([
  "rss",
  "api",
  "csv",
  "html",
  "greenhouse",
  "lever",
  "workday",
  "government",
]);

const robotsCache = new Map<string, string | null>();

function normalizeHost(host: string) {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ruleMatches(pathname: string, rulePath: string) {
  if (!rulePath) {
    return false;
  }

  const pattern = `^${escapeRegExp(rulePath).replace(/\\\*/g, ".*")}`;
  return new RegExp(pattern).test(pathname);
}

function evaluateRobotsPolicy(robotsTxt: string, url: URL) {
  const lines = robotsTxt
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean);

  const groups: Array<{
    userAgents: string[];
    rules: Array<{ type: "allow" | "disallow"; path: string }>;
  }> = [];

  let currentGroup: { userAgents: string[]; rules: Array<{ type: "allow" | "disallow"; path: string }> } | null = null;

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) {
      continue;
    }

    const directive = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (directive === "user-agent") {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
      }

      currentGroup.userAgents.push(value.toLowerCase());
      continue;
    }

    if ((directive === "allow" || directive === "disallow") && currentGroup) {
      currentGroup.rules.push({
        type: directive,
        path: value,
      });
    }
  }

  const pathname = `${url.pathname}${url.search}`;
  const matchingGroups = groups.filter((group) => group.userAgents.some((agent) => agent === "*" || agent === "jobpulseindiabot"));

  let bestRule: { type: "allow" | "disallow"; path: string } | null = null;

  for (const group of matchingGroups) {
    for (const rule of group.rules) {
      if (!rule.path || !ruleMatches(pathname, rule.path)) {
        continue;
      }

      if (!bestRule || rule.path.length > bestRule.path.length || (rule.path.length === bestRule.path.length && rule.type === "allow")) {
        bestRule = rule;
      }
    }
  }

  return bestRule?.type !== "disallow";
}

export function isBlockedHost(host: string) {
  const normalizedHost = normalizeHost(host);
  return BLOCKED_HOST_PATTERNS.some((pattern) => normalizedHost.includes(pattern));
}

export function validateSourceUrl(sourceUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(sourceUrl);
  } catch (error) {
    throw new FetcherError("INVALID_SOURCE", `Invalid source URL: ${sourceUrl}`, error);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new FetcherError("INVALID_SOURCE", `Unsupported source protocol: ${parsed.protocol}`);
  }

  if (isBlockedHost(parsed.hostname)) {
    throw new FetcherError(
      "INVALID_SOURCE",
      "This source URL is blocked. JobPulse India only fetches from official or explicitly allowed sources.",
    );
  }
}

export function validateJobSource(source: JobSourceRecord) {
  if (!source?.id || !source.source_url) {
    throw new FetcherError("INVALID_SOURCE", "Source record is missing required fields.");
  }

  if (source.status !== "active") {
    throw new FetcherError("INVALID_SOURCE", `Source ${source.name} is not active.`);
  }

  const transport = String(source.transport_type ?? "").toLowerCase() as SupportedTransportType;
  if (!SUPPORTED_TRANSPORTS.has(transport)) {
    throw new FetcherError("INVALID_SOURCE", `Unsupported transport type: ${source.transport_type}`);
  }

  validateSourceUrl(source.source_url);
}

export function isUrlAllowedForSource(source: JobSourceRecord, targetUrl: string) {
  let sourceParsed: URL;
  let targetParsed: URL;

  try {
    sourceParsed = new URL(source.source_url);
    targetParsed = new URL(targetUrl);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(targetParsed.protocol) || isBlockedHost(targetParsed.hostname)) {
    return false;
  }

  const sourceHost = normalizeHost(sourceParsed.hostname);
  const targetHost = normalizeHost(targetParsed.hostname);
  if (targetHost === sourceHost || targetHost.endsWith(`.${sourceHost}`)) {
    return true;
  }

  const config = parseJobSourceConfig({
    sourceType: source.source_type,
    transportType: source.transport_type,
    config: source.config,
  });

  return config.allowedDetailDomains.some(
    (allowedDomain) => targetHost === allowedDomain || targetHost.endsWith(`.${allowedDomain}`),
  );
}

export async function canFetchUrlPerRobots(url: string, timeoutMs = 5_000) {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const origin = parsed.origin;
  if (!robotsCache.has(origin)) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${origin}/robots.txt`, {
        method: "GET",
        signal: controller.signal,
        cache: "force-cache",
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/plain, */*;q=0.1",
        },
      });

      robotsCache.set(origin, response.ok ? await response.text() : null);
    } catch {
      robotsCache.set(origin, null);
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  const robotsTxt = robotsCache.get(origin);
  if (!robotsTxt) {
    return true;
  }

  return evaluateRobotsPolicy(robotsTxt, parsed);
}

export async function fetchUrlPayload(
  url: string,
  options?: {
    timeoutMs?: number;
    accept?: string;
    respectRobots?: boolean;
  },
): Promise<SourcePayload> {
  validateSourceUrl(url);

  const timeoutMs = options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (options?.respectRobots) {
      const allowedByRobots = await canFetchUrlPerRobots(url, Math.min(timeoutMs, 5_000));
      if (!allowedByRobots) {
        throw new FetcherError("INVALID_SOURCE", `Fetching ${url} is disallowed by robots.txt.`);
      }
    }

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Accept: options?.accept ?? "application/json, text/xml, application/xml, text/csv, text/html;q=0.9",
      },
    });

    if (!response.ok) {
      throw new FetcherError("NETWORK_FAILURE", `Fetch failed with status ${response.status}.`);
    }

    return {
      contentType: response.headers.get("content-type") ?? "",
      body: await response.text(),
      fetchedUrl: response.url || url,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof FetcherError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new FetcherError("TIMEOUT", `Fetch timed out after ${timeoutMs}ms.`, error);
    }

    throw new FetcherError("NETWORK_FAILURE", "Network failure while fetching source.", error);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export async function fetchSourcePayload(
  source: JobSourceRecord,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<SourcePayload> {
  validateJobSource(source);

  return fetchUrlPayload(source.source_url, {
    timeoutMs,
    respectRobots: true,
  });
}
