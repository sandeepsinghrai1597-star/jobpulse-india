import { createHash } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { JobSourceRow } from "@/lib/jobs/ingestion";

const DEFAULT_USER_AGENT = "JobPulseIndiaBot/2.0 (+https://jobpulseindia.in)";

type GovernmentSourceConfig = {
  category: string | null;
  categorySlug: string | null;
  department: string | null;
  state: string | null;
};

type ExtractedGovernmentJob = {
  fetchKey: string;
  title: string;
  department: string;
  category: string;
  categorySlug: string | null;
  state: string | null;
  eligibility: string | null;
  ageLimit: string | null;
  applicationFee: string | null;
  lastDate: string | null;
  notificationUrl: string | null;
  officialApplyUrl: string | null;
  sourceUrl: string;
  summary: string | null;
  metadata: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
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

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function absoluteUrl(baseUrl: string, candidateUrl: string | null | undefined) {
  if (!candidateUrl) {
    return null;
  }

  try {
    return new URL(candidateUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function parseGovernmentSourceConfig(config: unknown): GovernmentSourceConfig {
  const record = isRecord(config) ? config : {};

  return {
    category: normalizeString(record.category),
    categorySlug: normalizeString(record.categorySlug),
    department: normalizeString(record.department),
    state: normalizeString(record.state ?? record.defaultState),
  };
}

function inferCategory(title: string, fallback: string | null) {
  if (fallback) return fallback;

  const normalized = title.toLowerCase();
  if (/\bssc\b/.test(normalized)) return "SSC";
  if (/\bupsc\b/.test(normalized)) return "UPSC";
  if (/\b(bank|ibps|sbi|rbi|nabard)\b/.test(normalized)) return "Banking";
  if (/\b(rrb|railway|railways)\b/.test(normalized)) return "Railways";
  if (/\b(army|navy|air force|agniveer|defence|drdo)\b/.test(normalized)) return "Defence";
  if (/\b(police|constable|si)\b/.test(normalized)) return "Police";
  if (/\b(teacher|teaching|lecturer|professor|kvs|school)\b/.test(normalized)) return "Teaching";
  return "State Government";
}

function inferCategorySlug(title: string, fallback: string | null) {
  if (fallback) return fallback;

  const category = inferCategory(title, null);
  return slugify(category);
}

function normalizeDate(value: string | null) {
  if (!value) return null;

  const normalized = value.replace(/\s+/g, " ").trim();
  const isoMatch = normalized.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  const dmyMatch = normalized.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }

  const textualMatch = normalized.match(/\b(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})\b/);
  if (textualMatch) {
    const monthMap: Record<string, string> = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      sept: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };

    const month = monthMap[textualMatch[2].toLowerCase()];
    if (month) {
      return `${textualMatch[3]}-${month}-${textualMatch[1].padStart(2, "0")}`;
    }
  }

  return null;
}

function extractDateField(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(
      `\\b${label}\\b\\s*[:\\-]?\\s*([^|.;\\n]{4,80})`,
      "i",
    );
    const match = text.match(pattern);
    const value = match?.[1]?.trim();
    if (value) {
      return normalizeDate(value) ?? value;
    }
  }

  return null;
}

function extractLabeledValue(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(
      `\\b${label}\\b\\s*[:\\-]?\\s*([^|.;\\n]{3,160})`,
      "i",
    );
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

type HtmlLink = {
  href: string;
  text: string;
};

type CandidateBlock = {
  html: string;
  text: string;
  links: HtmlLink[];
};

function extractLinks(html: string, baseUrl: string) {
  return Array.from(
    html.matchAll(/<a\b[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi),
  )
    .map((match) => {
      const href = absoluteUrl(baseUrl, match[1] ?? match[2] ?? match[3] ?? "");
      const text = stripHtml(decodeHtmlEntities(match[4] ?? ""));

      if (!href || !text) {
        return null;
      }

      return { href, text } satisfies HtmlLink;
    })
    .filter((item): item is HtmlLink => Boolean(item));
}

function buildCandidateBlocks(body: string, baseUrl: string) {
  const snippets = new Map<string, CandidateBlock>();
  const blockPatterns = [
    /<article\b[\s\S]{0,12000}?<\/article>/gi,
    /<tr\b[\s\S]{0,8000}?<\/tr>/gi,
    /<li\b[\s\S]{0,8000}?<\/li>/gi,
    /<div\b[\s\S]{0,12000}?<\/div>/gi,
  ];

  for (const pattern of blockPatterns) {
    for (const match of body.matchAll(pattern)) {
      const html = match[0];
      const text = stripHtml(html);
      if (!/(notification|recruitment|vacanc|advertisement|apply|admit|exam)/i.test(text)) {
        continue;
      }

      if (text.length < 30) {
        continue;
      }

      const key = text.slice(0, 220);
      if (!snippets.has(key)) {
        snippets.set(key, {
          html,
          text,
          links: extractLinks(html, baseUrl),
        });
      }
    }
  }

  for (const match of body.matchAll(/<a\b[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = absoluteUrl(baseUrl, match[1] ?? match[2] ?? match[3] ?? "");
    const text = stripHtml(match[4] ?? "");
    if (!href || !text || !/(notification|recruitment|vacanc|advertisement|apply|exam)/i.test(`${href} ${text}`)) {
      continue;
    }

    const start = Math.max(0, (match.index ?? 0) - 400);
    const end = Math.min(body.length, (match.index ?? 0) + match[0].length + 400);
    const html = body.slice(start, end);
    const key = `${href}|${text}`;

    if (!snippets.has(key)) {
      snippets.set(key, {
        html,
        text: stripHtml(html),
        links: extractLinks(html, baseUrl),
      });
    }
  }

  return Array.from(snippets.values());
}

function cleanTitle(value: string | null | undefined) {
  if (!value) return null;

  const cleaned = value
    .replace(/^(download|view|read)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 8 || cleaned.length > 220) {
    return null;
  }

  if (/^(pdf|notification|apply online)$/i.test(cleaned)) {
    return null;
  }

  return cleaned;
}

function extractTitle(candidate: CandidateBlock) {
  const headingMatch = candidate.html.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i);
  const heading = cleanTitle(stripHtml(headingMatch?.[1] ?? ""));
  if (heading) {
    return heading;
  }

  for (const link of candidate.links) {
    const title = cleanTitle(link.text);
    if (title && !/apply/i.test(title)) {
      return title;
    }
  }

  return null;
}

function pickNotificationLink(links: HtmlLink[]) {
  return (
    links.find((link) => /\.pdf(\?|$)/i.test(link.href)) ??
    links.find((link) => /(notification|advertisement|detailed notice|pdf)/i.test(link.text)) ??
    null
  );
}

function pickApplyLink(links: HtmlLink[]) {
  return (
    links.find((link) => /(apply|registration|online application|apply online)/i.test(link.text)) ??
    links.find((link) => /(apply|registration)/i.test(link.href)) ??
    null
  );
}

function buildSummary(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length <= 320 ? cleaned : `${cleaned.slice(0, 317)}...`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml;q=0.9",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Government source fetch failed with status ${response.status}`);
  }

  return response.text();
}

async function enrichFromDetailPage(base: ExtractedGovernmentJob) {
  const detailUrl = base.notificationUrl && !/\.pdf(\?|$)/i.test(base.notificationUrl)
    ? base.notificationUrl
    : base.sourceUrl;

  if (!detailUrl || detailUrl === base.sourceUrl) {
    return base;
  }

  try {
    const html = await fetchText(detailUrl);
    const text = stripHtml(html);
    const links = extractLinks(html, detailUrl);
    const notificationLink = pickNotificationLink(links);
    const applyLink = pickApplyLink(links);

    return {
      ...base,
      eligibility: base.eligibility ?? extractLabeledValue(text, ["eligibility", "qualification", "educational qualification"]),
      ageLimit: base.ageLimit ?? extractLabeledValue(text, ["age limit", "age"]),
      applicationFee: base.applicationFee ?? extractLabeledValue(text, ["application fee", "fee"]),
      lastDate: base.lastDate ?? extractDateField(text, ["last date", "closing date", "apply by"]),
      notificationUrl: base.notificationUrl ?? notificationLink?.href ?? null,
      officialApplyUrl: base.officialApplyUrl ?? applyLink?.href ?? null,
      summary: base.summary ?? buildSummary(text),
      metadata: {
        ...base.metadata,
        detail_url: detailUrl,
      },
    };
  } catch {
    return base;
  }
}

function buildFetchKey(sourceId: string, title: string, notificationUrl: string | null, applyUrl: string | null, sourceUrl: string) {
  return createHash("sha256")
    .update([sourceId, title.toLowerCase(), notificationUrl ?? "", applyUrl ?? "", sourceUrl].join("|"))
    .digest("hex");
}

async function extractGovernmentJobsFromHtml(source: JobSourceRow, html: string) {
  const baseUrl = source.source_url;
  const config = parseGovernmentSourceConfig(source.config);
  const candidates = buildCandidateBlocks(html, baseUrl);
  const jobs: ExtractedGovernmentJob[] = [];

  for (const candidate of candidates) {
    const title = extractTitle(candidate);
    if (!title) {
      continue;
    }

    const notificationLink = pickNotificationLink(candidate.links);
    const applyLink = pickApplyLink(candidate.links);
    const sourceUrl = firstNonEmpty(
      notificationLink && !/\.pdf(\?|$)/i.test(notificationLink.href) ? notificationLink.href : null,
      applyLink?.href,
      source.source_url,
    ) ?? source.source_url;

    const draft: ExtractedGovernmentJob = {
      fetchKey: buildFetchKey(source.id, title, notificationLink?.href ?? null, applyLink?.href ?? null, sourceUrl),
      title,
      department: config.department ?? source.name,
      category: inferCategory(title, config.category),
      categorySlug: inferCategorySlug(title, config.categorySlug),
      state: config.state ?? extractLabeledValue(candidate.text, ["state", "location"]),
      eligibility: extractLabeledValue(candidate.text, ["eligibility", "qualification", "educational qualification"]),
      ageLimit: extractLabeledValue(candidate.text, ["age limit", "age"]),
      applicationFee: extractLabeledValue(candidate.text, ["application fee", "fee"]),
      lastDate: extractDateField(candidate.text, ["last date", "closing date", "apply by"]),
      notificationUrl: notificationLink?.href ?? null,
      officialApplyUrl: applyLink?.href ?? null,
      sourceUrl,
      summary: buildSummary(candidate.text),
      metadata: {
        source_name: source.name,
        source_url: source.source_url,
        matched_links: candidate.links.slice(0, 6),
        excerpt: candidate.text.slice(0, 1200),
      },
    };

    jobs.push(await enrichFromDetailPage(draft));
  }

  const deduped = new Map<string, ExtractedGovernmentJob>();
  for (const job of jobs) {
    if (!deduped.has(job.fetchKey)) {
      deduped.set(job.fetchKey, job);
    }
  }

  return Array.from(deduped.values());
}

export async function syncGovernmentSource(source: JobSourceRow) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const html = await fetchText(source.source_url);
  const jobs = await extractGovernmentJobsFromHtml(source, html);
  let pendingReviewCount = 0;
  let duplicateCount = 0;

  for (const job of jobs) {
    const { data: existing } = await admin
      .from("government_jobs")
      .select("id, status")
      .eq("fetch_key", job.fetchKey)
      .maybeSingle();
    const existingRow = (existing as { id: string; status: "pending_review" | "approved" | "rejected" } | null) ?? null;

    const payload = {
      source_id: source.id,
      fetch_key: job.fetchKey,
      category_slug: job.categorySlug,
      title: job.title,
      slug: `${slugify(`${job.title}-${job.department}`)}-${job.fetchKey.slice(0, 8)}`,
      department: job.department,
      category: job.category,
      state: job.state,
      eligibility: job.eligibility,
      age_limit: job.ageLimit,
      fees: job.applicationFee,
      application_fee: job.applicationFee,
      last_date: normalizeDate(job.lastDate),
      official_url: source.source_url,
      notification_url: job.notificationUrl,
      official_apply_url: job.officialApplyUrl,
      source_url: job.sourceUrl,
      summary: job.summary,
      metadata: job.metadata,
      official_last_checked_at: new Date().toISOString(),
      status:
        existingRow?.status === "approved"
          ? "approved"
          : existingRow?.status === "rejected"
            ? "rejected"
            : "pending_review",
    };

    if (existingRow?.id) {
      await admin.from("government_jobs").update(payload as never).eq("id", existingRow.id);
      duplicateCount += 1;
    } else {
      await admin.from("government_jobs").insert(payload as never);
      pendingReviewCount += 1;
    }
  }

  return {
    fetchedCount: jobs.length,
    pendingReviewCount,
    duplicateCount,
  };
}
