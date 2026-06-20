import {
  FetcherError,
  type ExtractedRawJob,
  type JobSourceRecord,
  type SourcePayload,
} from "@/server/job-fetcher/types";
import { fetchUrlPayload, isBlockedHost, isUrlAllowedForSource } from "@/server/job-fetcher/source-runner";

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(input: string) {
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [];
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

function xmlAttributeValues(xml: string, tag: string, attribute: string) {
  return Array.from(
    xml.matchAll(new RegExp(`<${tag}\\b[^>]*\\b${attribute}=(?:"([^"]+)"|'([^']+)')[^>]*\\/?>`, "gi")),
  )
    .map((match) => decodeHtmlEntities((match[1] ?? match[2] ?? "").trim()))
    .filter(Boolean);
}

function firstNonEmptyList(...lists: Array<string[]>) {
  for (const list of lists) {
    if (list.length > 0) {
      return list;
    }
  }

  return [];
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => (value ?? "").trim()).filter(Boolean)));
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
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

function parseRss(body: string): ExtractedRawJob[] {
  const blocks = [
    ...Array.from(body.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]),
    ...Array.from(body.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((match) => match[0]),
  ];

  return blocks
    .map((block) => {
      const title = xmlValue(block, "title");
      const description = firstNonEmpty(xmlValue(block, "description"), xmlValue(block, "summary"), xmlValue(block, "content"));
      const feedLinks = firstNonEmptyList(
        xmlAttributeValues(block, "link", "href"),
        xmlValues(block, "link"),
        xmlAttributeValues(block, "a10:link", "href"),
      );
      const applyUrl = firstNonEmpty(
        feedLinks[0],
        block.match(/<link[^>]*href="([^"]+)"/i)?.[1],
        block.match(/<a10:link[^>]*href="([^"]+)"/i)?.[1],
      );
      const categories = uniqueStrings([
        ...xmlValues(block, "category"),
        ...xmlAttributeValues(block, "category", "term"),
        ...xmlValues(block, "dc:subject"),
        ...xmlValues(block, "skill"),
        ...xmlValues(block, "skills"),
      ]);
      const company = firstNonEmpty(
        xmlValue(block, "company"),
        xmlValue(block, "author"),
        xmlValue(block, "name"),
        xmlValue(block, "dc:creator"),
      );
      const location = firstNonEmpty(
        xmlValue(block, "location"),
        xmlValue(block, "jobLocation"),
        xmlValue(block, "geo:location"),
        xmlValue(block, "address"),
        xmlValue(block, "job_location"),
      );
      const publishedDate = firstNonEmpty(
        xmlValue(block, "pubDate"),
        xmlValue(block, "published"),
        xmlValue(block, "updated"),
        xmlValue(block, "dc:date"),
      );

      return {
        raw_title: title || null,
        raw_company: company,
        raw_location: location,
        raw_description: description,
        raw_apply_url: applyUrl,
        raw_salary: null,
        raw_experience: null,
        raw_job_type: null,
        raw_posted_date: publishedDate,
        raw_deadline: null,
        raw_data_json: {
          guid: firstNonEmpty(xmlValue(block, "guid"), applyUrl),
          link: applyUrl,
          sourceUrl: applyUrl,
          applyUrl,
          company,
          location,
          categories,
          skills: categories,
          feed_links: feedLinks,
        },
      } satisfies ExtractedRawJob;
    })
    .filter((job) => Boolean(job.raw_title));
}

function parseCsv(body: string): ExtractedRawJob[] {
  const rows = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

  const headers = splitCsvLine(rows[0]).map((header) => header.toLowerCase());
  return rows
    .slice(1)
    .map((line) => {
      const columns = splitCsvLine(line);
      const record = headers.reduce<Record<string, string>>((accumulator, header, index) => {
        accumulator[header] = columns[index] ?? "";
        return accumulator;
      }, {});

      return {
        raw_title: firstNonEmpty(record.title, record.role, record.position),
        raw_company: firstNonEmpty(record.company, record.company_name, record.organization),
        raw_location: firstNonEmpty(record.location, record.city, record.state),
        raw_description: firstNonEmpty(record.description, record.summary),
        raw_apply_url: firstNonEmpty(record.application_url, record.apply_url, record.url),
        raw_salary: firstNonEmpty(record.salary, record.salary_range),
        raw_experience: firstNonEmpty(record.experience, record.experience_required),
        raw_job_type: firstNonEmpty(record.job_type, record.employment_type),
        raw_posted_date: firstNonEmpty(record.posted_date, record.posted_at, record.created_at),
        raw_deadline: firstNonEmpty(record.deadline, record.valid_through),
        raw_data_json: record,
      } satisfies ExtractedRawJob;
    })
    .filter((job) => Boolean(job.raw_title));
}

function parseJson(body: string): ExtractedRawJob[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch (error) {
    throw new FetcherError("PARSING_FAILURE", "Unable to parse JSON source payload.", error);
  }

  return getArrayCandidate(parsed)
    .map((entry) => ({
      raw_title: firstNonEmpty(
        typeof entry.title === "string" ? entry.title : undefined,
        typeof entry.name === "string" ? entry.name : undefined,
        typeof entry.position === "string" ? entry.position : undefined,
      ),
      raw_company: firstNonEmpty(
        typeof entry.company_name === "string" ? entry.company_name : undefined,
        typeof entry.company === "string" ? entry.company : undefined,
        typeof entry.organization === "string" ? entry.organization : undefined,
      ),
      raw_location: firstNonEmpty(
        typeof entry.location === "string" ? entry.location : undefined,
        typeof entry.city === "string" ? entry.city : undefined,
      ),
      raw_description: firstNonEmpty(
        typeof entry.description === "string" ? entry.description : undefined,
        typeof entry.summary === "string" ? entry.summary : undefined,
        typeof entry.content === "string" ? entry.content : undefined,
      ),
      raw_apply_url: firstNonEmpty(
        typeof entry.application_url === "string" ? entry.application_url : undefined,
        typeof entry.apply_url === "string" ? entry.apply_url : undefined,
        typeof entry.absolute_url === "string" ? entry.absolute_url : undefined,
        typeof entry.url === "string" ? entry.url : undefined,
      ),
      raw_salary: firstNonEmpty(
        typeof entry.salary === "string" ? entry.salary : undefined,
        typeof entry.salary_range === "string" ? entry.salary_range : undefined,
      ),
      raw_experience: firstNonEmpty(
        typeof entry.experience_required === "string" ? entry.experience_required : undefined,
        typeof entry.experience === "string" ? entry.experience : undefined,
      ),
      raw_job_type: firstNonEmpty(
        typeof entry.job_type === "string" ? entry.job_type : undefined,
        typeof entry.employment_type === "string" ? entry.employment_type : undefined,
      ),
      raw_posted_date: firstNonEmpty(
        typeof entry.posted_date === "string" ? entry.posted_date : undefined,
        typeof entry.updated_at === "string" ? entry.updated_at : undefined,
        typeof entry.created_at === "string" ? entry.created_at : undefined,
      ),
      raw_deadline: firstNonEmpty(
        typeof entry.deadline === "string" ? entry.deadline : undefined,
        typeof entry.validThrough === "string" ? String(entry.validThrough) : undefined,
      ),
      raw_data_json: {
        ...entry,
        skills: toStringList(entry.skills),
        requirements: toStringList(entry.requirements),
        responsibilities: toStringList(entry.responsibilities),
      },
    }))
    .filter((job) => Boolean(job.raw_title));
}

type HtmlLink = {
  href: string;
  text: string;
};

type HtmlCandidate = {
  html: string;
  text: string;
  links: HtmlLink[];
};

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

function extractLinks(html: string, baseUrl: string) {
  return Array.from(html.matchAll(/<a\b[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi))
    .map((match) => {
      const href = absoluteUrl(baseUrl, match[1] ?? match[2] ?? match[3] ?? "");
      const text = stripHtml(match[4] ?? "");

      if (!href || !text) {
        return null;
      }

      return {
        href,
        text,
      } satisfies HtmlLink;
    })
    .filter((link): link is HtmlLink => Boolean(link));
}

function cleanTitle(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const title = stripHtml(value)
    .replace(/\s+/g, " ")
    .replace(/^(apply|view details|learn more)\b[:\-\s]*/i, "")
    .trim();

  if (!title || title.length < 3 || title.length > 160) {
    return null;
  }

  if (/^(apply now|view details|learn more|read more|job openings|careers?)$/i.test(title)) {
    return null;
  }

  return title;
}

function looksLikeJobLink(text: string, href: string) {
  const normalizedText = text.toLowerCase();
  const normalizedHref = href.toLowerCase();
  return (
    /job|career|opening|position|role|vacanc|requisition|apply/.test(normalizedText) ||
    /job|career|opening|position|role|vacanc|requisition|apply/.test(normalizedHref)
  );
}

function buildHtmlCandidates(body: string, baseUrl: string) {
  const snippets = new Map<string, HtmlCandidate>();
  const blockPatterns = [
    /<article\b[\s\S]{0,12000}?<\/article>/gi,
    /<li\b[\s\S]{0,8000}?<\/li>/gi,
    /<div\b[^>]*(?:class|id)=(?:"[^"]*(?:job|career|opening|position|role|vacanc)[^"]*"|'[^']*(?:job|career|opening|position|role|vacanc)[^']*')[^>]*>[\s\S]{0,12000}?<\/div>/gi,
  ];

  for (const pattern of blockPatterns) {
    for (const match of body.matchAll(pattern)) {
      const html = match[0];
      const text = stripHtml(html);
      if (text.length < 20) {
        continue;
      }

      const key = text.slice(0, 240);
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
    const text = cleanTitle(match[4] ?? "");
    if (!href || !text || !looksLikeJobLink(text, href)) {
      continue;
    }

    const start = Math.max(0, match.index - 400);
    const end = Math.min(body.length, (match.index ?? 0) + match[0].length + 400);
    const html = body.slice(start, end);
    const blockText = stripHtml(html);
    const key = `${href}|${text}`;

    if (!snippets.has(key)) {
      snippets.set(key, {
        html,
        text: blockText,
        links: extractLinks(html, baseUrl),
      });
    }
  }

  return Array.from(snippets.values());
}

function chooseBestLink(candidate: HtmlCandidate, source: JobSourceRecord, baseUrl: string) {
  let bestLink: HtmlLink | null = null;
  let bestScore = -1;

  for (const link of candidate.links) {
    let score = 0;

    if (!/^https?:/i.test(link.href)) {
      continue;
    }

    const parsed = new URL(link.href, baseUrl);
    if (isBlockedHost(parsed.hostname)) {
      continue;
    }

    if (!isUrlAllowedForSource(source, parsed.toString())) {
      continue;
    }

    score += 5;

    if (looksLikeJobLink(link.text, parsed.toString())) {
      score += 3;
    }

    if (/apply/i.test(link.text)) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestLink = {
        href: parsed.toString(),
        text: link.text,
      };
    }
  }

  return bestLink;
}

function extractLocationText(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();

  const labeledMatch = normalized.match(/\b(?:location|job location|based in)\s*[:\-]\s*([^|.;]{2,100})/i);
  if (labeledMatch?.[1]) {
    return labeledMatch[1].trim();
  }

  const remoteMatch = normalized.match(/\b(remote|hybrid|onsite|work from home|wfh)\b/i);
  if (remoteMatch?.[1]) {
    return remoteMatch[1].trim();
  }

  const separatorMatch = normalized.match(/\b(?:india|remote)\b\s*[|,-]\s*([^|.;]{2,80})/i);
  if (separatorMatch?.[0]) {
    return separatorMatch[0].trim();
  }

  return null;
}

function extractDateField(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`\\b${label}\\b\\s*[:\\-]\\s*([^|.;]{4,80})`, "i");
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractTitleFromCandidate(candidate: HtmlCandidate, preferredLink: HtmlLink | null) {
  const headingMatch = candidate.html.match(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i);
  const title = cleanTitle(headingMatch?.[1] ?? preferredLink?.text ?? null);
  if (title) {
    return title;
  }

  for (const link of candidate.links) {
    const linkTitle = cleanTitle(link.text);
    if (linkTitle && !/apply/i.test(linkTitle)) {
      return linkTitle;
    }
  }

  return null;
}

function extractDescriptionFromHtml(html: string) {
  const priorityMatches = [
    ...Array.from(
      html.matchAll(
        /<(?:section|div|article|main)\b[^>]*(?:class|id)=(?:"[^"]*(?:job-description|description|details|content|posting)[^"]*"|'[^']*(?:job-description|description|details|content|posting)[^']*')[^>]*>([\s\S]{40,20000}?)<\/(?:section|div|article|main)>/gi,
      ),
    ).map((match) => stripHtml(match[1] ?? "")),
    ...Array.from(html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)).map((match) => stripHtml(match[1] ?? "")),
  ]
    .map((value) => value.trim())
    .filter((value) => value.length >= 80);

  return priorityMatches.sort((left, right) => right.length - left.length)[0] ?? null;
}

function extractStructuredJobsFromHtml(body: string) {
  const ldJsonBlocks = Array.from(
    body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  );

  const structuredJobs: ExtractedRawJob[] = [];
  for (const block of ldJsonBlocks) {
    const content = block[1]?.trim();
    if (!content) {
      continue;
    }

    try {
      const parsed = JSON.parse(content) as Record<string, unknown> | Array<Record<string, unknown>>;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"] !== "JobPosting") {
          continue;
        }

        const hiringOrganization =
          typeof item.hiringOrganization === "object" && item.hiringOrganization
            ? (item.hiringOrganization as Record<string, unknown>)
            : null;

        structuredJobs.push({
          raw_title: typeof item.title === "string" ? item.title : null,
          raw_company: typeof hiringOrganization?.name === "string" ? hiringOrganization.name : null,
          raw_location:
            typeof item.jobLocation === "string"
              ? item.jobLocation
              : typeof item.jobLocation === "object" && item.jobLocation
                ? JSON.stringify(item.jobLocation)
                : null,
          raw_description: typeof item.description === "string" ? item.description : null,
          raw_apply_url: typeof item.url === "string" ? item.url : null,
          raw_salary:
            typeof item.baseSalary === "string"
              ? item.baseSalary
              : item.baseSalary
                ? JSON.stringify(item.baseSalary)
                : null,
          raw_experience: null,
          raw_job_type: typeof item.employmentType === "string" ? item.employmentType : null,
          raw_posted_date: typeof item.datePosted === "string" ? item.datePosted : null,
          raw_deadline: typeof item.validThrough === "string" ? item.validThrough : null,
          raw_data_json: item,
        });
      }
    } catch {
      continue;
    }
  }

  return structuredJobs.filter((job) => Boolean(job.raw_title));
}

async function enrichWithDetailPage(
  source: JobSourceRecord,
  baseUrl: string,
  applyUrl: string | null,
  currentDescription: string | null,
) {
  if (!applyUrl || !isUrlAllowedForSource(source, applyUrl) || (currentDescription?.length ?? 0) >= 140) {
    return {
      description: currentDescription,
      detailPayload: null as Record<string, unknown> | null,
    };
  }

  const detailPayload = await fetchUrlPayload(applyUrl, {
    accept: "text/html,application/xhtml+xml;q=0.9",
    respectRobots: true,
  });

  const description = extractDescriptionFromHtml(detailPayload.body) ?? currentDescription;
  return {
    description,
    detailPayload: {
      detail_url: applyUrl,
      detail_fetched_url: detailPayload.fetchedUrl || applyUrl,
      detail_status: detailPayload.status,
      detail_content_type: detailPayload.contentType,
      listing_url: baseUrl,
    },
  };
}

async function parseHtml(source: JobSourceRecord, payload: SourcePayload): Promise<ExtractedRawJob[]> {
  const structuredJobs = extractStructuredJobsFromHtml(payload.body);
  if (structuredJobs.length > 0) {
    return structuredJobs;
  }

  const baseUrl = payload.fetchedUrl || source.source_url;
  const candidates = buildHtmlCandidates(payload.body, baseUrl);
  const extracted: ExtractedRawJob[] = [];
  const seenKeys = new Set<string>();

  for (const candidate of candidates) {
    const preferredLink = chooseBestLink(candidate, source, baseUrl);
    const title = extractTitleFromCandidate(candidate, preferredLink);
    if (!title) {
      continue;
    }

    const applyUrl = preferredLink?.href ?? null;
    const dedupeKey = `${title.toLowerCase()}|${(applyUrl ?? source.source_url).toLowerCase()}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    let description = candidate.text.length >= 80 ? candidate.text : null;
    let detailMetadata: Record<string, unknown> | null = null;

    try {
      const detailResult = await enrichWithDetailPage(source, baseUrl, applyUrl, description);
      description = detailResult.description;
      detailMetadata = detailResult.detailPayload;
    } catch {
      detailMetadata = {
        detail_url: applyUrl,
        detail_fetch_failed: true,
      };
    }

    extracted.push({
      raw_title: title,
      raw_company: null,
      raw_location: extractLocationText(candidate.text),
      raw_description: description,
      raw_apply_url: applyUrl,
      raw_salary: null,
      raw_experience: null,
      raw_job_type: null,
      raw_posted_date: extractDateField(candidate.text, ["posted", "date posted", "published", "date"]),
      raw_deadline: extractDateField(candidate.text, ["deadline", "apply by", "closing date", "last date"]),
      raw_data_json: {
        sourceUrl: source.source_url,
        listingUrl: baseUrl,
        sourceDomain: new URL(source.source_url).hostname.toLowerCase(),
        applyUrl,
        detailFetchAllowed: Boolean(applyUrl && isUrlAllowedForSource(source, applyUrl)),
        cardText: candidate.text.slice(0, 3000),
        matchedLinks: candidate.links.slice(0, 5),
        ...(detailMetadata ?? {}),
      },
    });
    seenKeys.add(dedupeKey);
  }

  return extracted.filter((job) => Boolean(job.raw_title));
}

export async function extractRawJobsFromPayload(source: JobSourceRecord, payload: SourcePayload) {
  const transport = String(source.transport_type ?? "").toLowerCase();
  const contentType = payload.contentType.toLowerCase();

  let jobs: ExtractedRawJob[] = [];

  if (transport === "rss" || contentType.includes("xml") || payload.body.includes("<rss")) {
    jobs = parseRss(payload.body);
  } else if (transport === "csv" || contentType.includes("csv")) {
    jobs = parseCsv(payload.body);
  } else if (
    transport === "api" ||
    transport === "greenhouse" ||
    transport === "lever" ||
    transport === "workday" ||
    contentType.includes("json")
  ) {
    jobs = parseJson(payload.body);
  } else {
    jobs = await parseHtml(source, payload);
  }

  if (jobs.length === 0) {
    throw new FetcherError("EMPTY_RESULT", `No jobs extracted from source ${source.name}.`);
  }

  return jobs;
}
