import type { Job } from "@/types";
import { getUnifiedJobs } from "@/lib/jobs/live";

export const JOBS_PAGE_SIZE = 12;
const MAX_SKILL_FACETS = 12;
const MAX_RELATED_SEARCHES = 8;

export type JobsSortOption =
  | "latest"
  | "salary-high"
  | "deadline-soon"
  | "featured-first";

export type JobsSalaryRange =
  | "under-300k"
  | "300k-600k"
  | "600k-1200k"
  | "1200k-plus";

export type JobsExperienceRange =
  | "fresher"
  | "1-3"
  | "3-5"
  | "5-plus";

export type JobsPostedDateRange = "24h" | "7d" | "30d";

export interface PublicJobsQuery {
  keyword: string;
  city: string;
  state: string;
  salary: JobsSalaryRange | "";
  experience: JobsExperienceRange | "";
  education: string;
  jobType: string;
  workMode: string;
  industry: string;
  skills: string[];
  postedDate: JobsPostedDateRange | "";
  verified: boolean;
  featured: boolean;
  remote: boolean;
  fresher: boolean;
  sort: JobsSortOption;
  page: number;
}

export interface JobsFacetOption {
  label: string;
  value: string;
  count: number;
}

export interface PublicJobsFacets {
  education: JobsFacetOption[];
  jobTypes: JobsFacetOption[];
  workModes: JobsFacetOption[];
  industries: JobsFacetOption[];
  skills: JobsFacetOption[];
}

export interface RelatedSearchLink {
  label: string;
  href: string;
}

export interface PublicJobsSearchResult {
  allResults: Job[];
  results: Job[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: PublicJobsFacets;
  relatedSearches: RelatedSearchLink[];
}

const EMPTY_QUERY: PublicJobsQuery = {
  keyword: "",
  city: "",
  state: "",
  salary: "",
  experience: "",
  education: "",
  jobType: "",
  workMode: "",
  industry: "",
  skills: [],
  postedDate: "",
  verified: false,
  featured: false,
  remote: false,
  fresher: false,
  sort: "latest",
  page: 1,
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function listValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function booleanValue(value: string | string[] | undefined) {
  const normalized = firstValue(value).toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on";
}

function numberValue(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(firstValue(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function getPostedDate(job: Job) {
  return parseDate(job.publishedAt ?? undefined) ?? parseDate(job.createdAt);
}

function getDeadlineDate(job: Job) {
  return parseDate(job.applicationDeadline);
}

function annualizeSalary(job: Job) {
  const max = Math.max(job.salaryMin, job.salaryMax, 0);

  if (job.salaryType === "monthly" || job.salaryType === "stipend") {
    return max * 12;
  }

  return max;
}

function jobMatchesExperience(job: Job, experience: JobsExperienceRange) {
  const value = `${job.experienceRequired} ${job.title} ${job.categorySlug ?? ""}`.toLowerCase();

  switch (experience) {
    case "fresher":
      return /\b(fresher|entry level|entry-level|graduate|0[-\s]*1|0[-\s]*2|0 years?)\b/.test(value);
    case "1-3":
      return /\b(1[-\s]*3|1[-\s]*2|2[-\s]*3|1 year|2 years?|3 years?)\b/.test(value);
    case "3-5":
      return /\b(3[-\s]*5|4[-\s]*5|4 years?|5 years?)\b/.test(value);
    case "5-plus":
      return /\b(5\+|6\+|7\+|8\+|senior|lead|manager|6 years?|7 years?|8 years?|10 years?)\b/.test(value);
    default:
      return true;
  }
}

function jobMatchesSalary(job: Job, salary: JobsSalaryRange) {
  const annualized = annualizeSalary(job);
  if (annualized <= 0) {
    return false;
  }

  switch (salary) {
    case "under-300k":
      return annualized < 300000;
    case "300k-600k":
      return annualized >= 300000 && annualized < 600000;
    case "600k-1200k":
      return annualized >= 600000 && annualized < 1200000;
    case "1200k-plus":
      return annualized >= 1200000;
    default:
      return true;
  }
}

function jobMatchesPostedDate(job: Job, postedDate: JobsPostedDateRange) {
  const posted = getPostedDate(job);
  if (!posted) {
    return false;
  }

  const diffMs = Date.now() - posted.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  switch (postedDate) {
    case "24h":
      return diffMs <= dayMs;
    case "7d":
      return diffMs <= 7 * dayMs;
    case "30d":
      return diffMs <= 30 * dayMs;
    default:
      return true;
  }
}

function sortJobs(jobs: Job[], sort: JobsSortOption) {
  return [...jobs].sort((a, b) => {
    const aPosted = getPostedDate(a)?.getTime() ?? 0;
    const bPosted = getPostedDate(b)?.getTime() ?? 0;
    const aDeadline = getDeadlineDate(a)?.getTime() ?? Number.POSITIVE_INFINITY;
    const bDeadline = getDeadlineDate(b)?.getTime() ?? Number.POSITIVE_INFINITY;
    const aSalary = annualizeSalary(a);
    const bSalary = annualizeSalary(b);

    switch (sort) {
      case "salary-high":
        return bSalary - aSalary || bPosted - aPosted;
      case "deadline-soon":
        return aDeadline - bDeadline || bPosted - aPosted;
      case "featured-first":
        return Number(b.featured) - Number(a.featured) || bPosted - aPosted;
      case "latest":
      default:
        return bPosted - aPosted;
    }
  });
}

function createFacetOptions(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({
      label: value,
      value,
      count,
    }));
}

function buildFacets(jobs: Job[]): PublicJobsFacets {
  return {
    education: createFacetOptions(jobs.map((job) => job.educationRequired)).slice(0, 10),
    jobTypes: createFacetOptions(jobs.map((job) => job.jobType)),
    workModes: createFacetOptions(jobs.map((job) => job.workMode)),
    industries: createFacetOptions(jobs.map((job) => job.industry)).slice(0, 10),
    skills: createFacetOptions(jobs.flatMap((job) => job.skills)).slice(0, MAX_SKILL_FACETS),
  };
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function buildQueryString(query: PublicJobsQuery) {
  const params = new URLSearchParams();

  if (query.keyword) params.set("keyword", query.keyword);
  if (query.city) params.set("city", query.city);
  if (query.state) params.set("state", query.state);
  if (query.salary) params.set("salary", query.salary);
  if (query.experience) params.set("experience", query.experience);
  if (query.education) params.set("education", query.education);
  if (query.jobType) params.set("jobType", query.jobType);
  if (query.workMode) params.set("workMode", query.workMode);
  if (query.industry) params.set("industry", query.industry);
  for (const skill of query.skills) {
    params.append("skills", skill);
  }
  if (query.postedDate) params.set("postedDate", query.postedDate);
  if (query.verified) params.set("verified", "true");
  if (query.featured) params.set("featured", "true");
  if (query.remote) params.set("remote", "true");
  if (query.fresher) params.set("fresher", "true");
  if (query.sort !== "latest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));

  return params.toString();
}

function createQueryHref(partial: Partial<PublicJobsQuery>) {
  const query = { ...EMPTY_QUERY, ...partial };
  const queryString = buildQueryString(query);
  return queryString ? `/jobs?${queryString}` : "/jobs";
}

function buildRelatedSearches(query: PublicJobsQuery, jobs: Job[], facets: PublicJobsFacets) {
  const links: RelatedSearchLink[] = [];
  const seen = new Set<string>();

  function push(label: string, partial: Partial<PublicJobsQuery>) {
    const href = createQueryHref(partial);
    if (seen.has(href) || href === createQueryHref(query)) {
      return;
    }

    seen.add(href);
    links.push({ label, href });
  }

  if (!query.remote) {
    push("Remote jobs", { ...query, remote: true, workMode: "remote", page: 1 });
  }
  if (!query.fresher) {
    push("Fresher jobs", { ...query, fresher: true, page: 1 });
  }
  if (!query.featured) {
    push("Featured jobs", { ...query, featured: true, sort: "featured-first", page: 1 });
  }

  for (const city of createFacetOptions(jobs.map((job) => job.city)).slice(0, 3)) {
    push(`${city.label} jobs`, { ...query, city: city.value, page: 1 });
  }

  for (const skill of facets.skills.slice(0, 3)) {
    push(`${skill.label} jobs`, { ...query, skills: [skill.value], page: 1 });
  }

  if (!query.keyword) {
    for (const type of facets.jobTypes.slice(0, 2)) {
      push(`${titleCase(type.label)} jobs`, { ...query, jobType: type.value, page: 1 });
    }
  }

  return links.slice(0, MAX_RELATED_SEARCHES);
}

export function parsePublicJobsQuery(
  params: Record<string, string | string[] | undefined>,
): PublicJobsQuery {
  return {
    keyword: firstValue(params.keyword).trim(),
    city: firstValue(params.city).trim(),
    state: firstValue(params.state).trim(),
    salary: (firstValue(params.salary) as JobsSalaryRange | "") || "",
    experience: (firstValue(params.experience) as JobsExperienceRange | "") || "",
    education: firstValue(params.education).trim(),
    jobType: firstValue(params.jobType).trim(),
    workMode: firstValue(params.workMode).trim(),
    industry: firstValue(params.industry).trim(),
    skills: listValue(params.skills),
    postedDate: (firstValue(params.postedDate) as JobsPostedDateRange | "") || "",
    verified: booleanValue(params.verified),
    featured: booleanValue(params.featured),
    remote: booleanValue(params.remote),
    fresher: booleanValue(params.fresher),
    sort: ((firstValue(params.sort) as JobsSortOption) || "latest"),
    page: numberValue(params.page, 1),
  };
}

export function filterPublicJobs(jobs: Job[], query: PublicJobsQuery) {
  const keyword = normalizeText(query.keyword);
  const city = normalizeText(query.city);
  const state = normalizeText(query.state);
  const education = normalizeText(query.education);
  const industry = normalizeText(query.industry);
  const selectedSkills = query.skills.map(normalizeText);

  return jobs.filter((job) => {
    const haystack = [
      job.title,
      job.companyName,
      job.description,
      job.city,
      job.state,
      job.industry,
      job.educationRequired,
      job.experienceRequired,
      job.skills.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = keyword ? haystack.includes(keyword) : true;
    const matchesCity = city ? job.city.toLowerCase().includes(city) : true;
    const matchesState = state ? job.state.toLowerCase().includes(state) : true;
    const matchesSalary = query.salary ? jobMatchesSalary(job, query.salary) : true;
    const matchesExperience = query.experience ? jobMatchesExperience(job, query.experience) : true;
    const matchesEducation = education ? job.educationRequired.toLowerCase().includes(education) : true;
    const matchesJobType = query.jobType ? job.jobType === query.jobType : true;
    const matchesWorkMode = query.workMode ? job.workMode === query.workMode : true;
    const matchesIndustry = industry ? job.industry.toLowerCase() === industry : true;
    const matchesSkills =
      selectedSkills.length > 0
        ? job.skills.some((skill) => selectedSkills.includes(skill.toLowerCase()))
        : true;
    const matchesPostedDate = query.postedDate ? jobMatchesPostedDate(job, query.postedDate) : true;
    const matchesVerified = query.verified ? Boolean(job.officialVerified) : true;
    const matchesFeatured = query.featured ? Boolean(job.featured) : true;
    const matchesRemote = query.remote ? job.workMode === "remote" : true;
    const matchesFresher = query.fresher ? jobMatchesExperience(job, "fresher") : true;

    return (
      job.status === "active" &&
      matchesKeyword &&
      matchesCity &&
      matchesState &&
      matchesSalary &&
      matchesExperience &&
      matchesEducation &&
      matchesJobType &&
      matchesWorkMode &&
      matchesIndustry &&
      matchesSkills &&
      matchesPostedDate &&
      matchesVerified &&
      matchesFeatured &&
      matchesRemote &&
      matchesFresher
    );
  });
}

export async function searchPublicJobs(
  query: PublicJobsQuery,
  jobs?: Job[],
): Promise<PublicJobsSearchResult> {
  const sourceJobs = jobs ?? (await getUnifiedJobs());
  const activeJobs = sourceJobs.filter((job) => job.status === "active");
  const facets = buildFacets(activeJobs);
  const filtered = filterPublicJobs(activeJobs, query);
  const sorted = sortJobs(filtered, query.sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * JOBS_PAGE_SIZE;
  const results = sorted.slice(start, start + JOBS_PAGE_SIZE);

  return {
    allResults: sorted,
    results,
    total,
    page,
    perPage: JOBS_PAGE_SIZE,
    totalPages,
    facets,
    relatedSearches: buildRelatedSearches(query, activeJobs, facets),
  };
}

export function toJobsSearchParams(query: PublicJobsQuery) {
  return buildQueryString(query);
}
