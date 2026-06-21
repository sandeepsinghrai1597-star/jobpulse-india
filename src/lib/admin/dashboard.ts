import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncExpiredJobs } from "@/server/jobs/expiration";

export type AdminSection =
  | "users"
  | "candidates"
  | "employers"
  | "companies"
  | "jobs"
  | "applications"
  | "government-jobs"
  | "internships"
  | "blog"
  | "seo"
  | "payments"
  | "reports"
  | "whatsapp"
  | "ai-usage"
  | "analytics";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export type AdminQueryState = {
  section: AdminSection;
  page: number;
  q: string;
  status: string;
};

export type PaginatedResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminOverviewMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminOverview = {
  metrics: AdminOverviewMetric[];
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "candidate" | "employer" | "admin";
  is_banned: boolean;
  created_at: string;
  last_seen_at: string | null;
};

export type AdminCandidateRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  preferred_roles: string[];
  verification_status: string;
  verified: boolean;
  verification_requested_at: string | null;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
  user_banned?: boolean;
};

export type AdminEmployerRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  company_name: string;
  recruiter_name: string | null;
  recruiter_phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  verified: boolean;
  approval_status: string;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
};

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  size_range: string | null;
  website: string | null;
  verified: boolean;
  rating: number | null;
  updated_at: string;
};

export type AdminJobRow = {
  id: string;
  title: string;
  slug: string;
  category_slug: string | null;
  company_name: string;
  city: string | null;
  state: string | null;
  job_type: string | null;
  work_mode: string | null;
  source_type: string | null;
  approval_status: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  deadline: string | null;
  published_at: string | null;
};

export type AdminJobReviewTab = "pending" | "active" | "rejected" | "flagged" | "expired";

export type AdminJobReviewRow = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  city: string | null;
  state: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string | null;
  experience_required: string | null;
  experience_min: number | null;
  experience_max: number | null;
  source_url: string | null;
  application_url: string | null;
  created_at: string;
  status: string;
  approval_status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_suspicious: boolean;
  suspicious_flags: string[];
  expires_at: string | null;
  published_at: string | null;
};

export type AdminJobReviewCounts = Record<AdminJobReviewTab, number>;

type ReviewFilterQuery<T> = {
  or: (filters: string) => T;
  eq: (column: string, value: string | boolean) => T;
};

export type AdminJobCategoryRow = {
  slug: string;
  name: string;
  job_family: string;
};

export type AdminApplicationRow = {
  id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  resume_id: string | null;
  resume_storage_path: string | null;
  resume_url: string | null;
  employer_notes: string | null;
  job_title?: string | null;
  company_name?: string | null;
  candidate_name?: string | null;
  candidate_city?: string | null;
  candidate_state?: string | null;
};

export type AdminGovernmentJobRow = {
  id: string;
  title: string;
  slug: string;
  department: string;
  category: string;
  state: string | null;
  last_date: string | null;
  official_url: string | null;
  notification_url: string | null;
  official_apply_url: string | null;
  source_url: string | null;
  summary: string | null;
  status: string;
  updated_at: string;
};

export type AdminInternshipRow = {
  id: string;
  title: string;
  slug: string;
  company: string;
  stipend: string | null;
  duration: string | null;
  location: string | null;
  work_mode: string | null;
  deadline: string | null;
  is_paid: boolean;
  updated_at: string;
};

export type AdminBlogRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  meta_title: string | null;
  updated_at: string;
};

export type AdminSeoRow = {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  city: string | null;
  state: string | null;
  category: string | null;
  indexable: boolean;
  updated_at: string;
};

export type AdminPaymentRow = {
  id: string;
  amount: number;
  plan: string;
  subscription_type: string | null;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
};

export type AdminReportRow = {
  id: string;
  job_id?: string | null;
  employer_id?: string | null;
  employer_user_id?: string | null;
  reason: string;
  details: string | null;
  status: string;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  job_title?: string | null;
  company_name?: string | null;
  reporter_name?: string | null;
  reporter_email?: string | null;
};

export type AdminWhatsappRow = {
  id: string;
  phone_number: string;
  city: string | null;
  category_slug: string | null;
  status: string;
  is_opted_in: boolean;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
};

export type AdminAiUsageRow = {
  id: string;
  kind: "resume-analysis" | "interview-session";
  actor: string;
  subject: string;
  created_at: string;
  score: number | null;
  detail: string;
};

export type AdminAnalyticsRow = {
  id: string;
  event_name: string;
  session_id: string | null;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
  detail: string;
};

export type AdminAnalyticsSummary = {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  revenue: number;
  aiUsage: number;
  whatsappSubscriptions: number;
  topCities: Array<{ name: string; count: number }>;
  topRoles: Array<{ name: string; count: number }>;
  topEvents: Array<{ name: string; count: number }>;
};

const PAGE_SIZE = 10;

function parseValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseAdminQueryState(searchParams: AdminSearchParams): AdminQueryState {
  const sectionValue = parseValue(searchParams.section);
  const validSections: AdminSection[] = [
    "users",
    "candidates",
    "employers",
    "companies",
    "jobs",
    "applications",
    "government-jobs",
    "internships",
    "blog",
    "seo",
    "payments",
    "reports",
    "whatsapp",
    "ai-usage",
    "analytics",
  ];

  const pageValue = Number.parseInt(parseValue(searchParams.page), 10);

  return {
    section: validSections.includes(sectionValue as AdminSection)
      ? (sectionValue as AdminSection)
      : "jobs",
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    q: parseValue(searchParams.q).trim(),
    status: parseValue(searchParams.status).trim(),
  };
}

function toLikePattern(value: string) {
  return `%${value.replace(/[%_]/g, "")}%`;
}

async function getDataClient() {
  return getSupabaseAdminClient() ?? (await createClient());
}

function getRange(page: number, pageSize = PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

function buildPaginatedResult<T>(rows: T[] | null, total: number | null, page: number): PaginatedResult<T> {
  return {
    rows: rows ?? [],
    total: total ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export const getAdminOverview = cache(async (): Promise<AdminOverview> => {
  const client = await getDataClient();

  const [
    users,
    jobs,
    applications,
    payments,
  ] = await Promise.all([
    client.from("users").select("*", { count: "exact", head: true }),
    client.from("jobs").select("*", { count: "exact", head: true }),
    client.from("applications").select("*", { count: "exact", head: true }),
    client.from("payments").select("amount, status"),
  ]);
  const revenue = ((payments.data as Array<{ amount?: number; status?: string }> | null) ?? []).reduce(
    (sum, payment) => (payment.status === "paid" ? sum + Number(payment.amount ?? 0) : sum),
    0,
  );

  return {
    metrics: [
      {
        label: "Total users",
        value: String(users.count ?? 0),
        detail: "Candidates, employers, and admins across the platform",
      },
      {
        label: "Total jobs",
        value: String(jobs.count ?? 0),
        detail: "Live, draft, pending, and archived job records",
      },
      {
        label: "Applications",
        value: String(applications.count ?? 0),
        detail: "Candidate applications submitted across all jobs",
      },
      {
        label: "Revenue",
        value: `₹${revenue.toLocaleString("en-IN")}`,
        detail: "Paid payment volume captured through Razorpay",
      },
    ],
  };
});

function buildTopCounts(values: Array<string | null | undefined>, limit = 5) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getUsersPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("users")
    .select("id, name, email, phone, role, is_banned, created_at, last_seen_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
  }

  if (state.status) {
    if (state.status === "banned") {
      query = query.eq("is_banned", true);
    } else if (["candidate", "employer", "admin"].includes(state.status)) {
      query = query.eq("role", state.status);
    }
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminUserRow[] | null, result.count, state.page);
}

export async function getCandidatesPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("candidate_profiles")
    .select(
      "id, user_id, full_name, phone, city, state, preferred_roles, verification_status, verified, verification_requested_at, updated_at, users!candidate_profiles_user_id_fkey(name, email, is_banned)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`full_name.ilike.${like},city.ilike.${like},state.ilike.${like},headline.ilike.${like}`);
  }

  if (state.status) {
    if (state.status === "verified") {
      query = query.eq("verified", true);
    } else {
      query = query.eq("verification_status", state.status);
    }
  }

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const user = row.users as { name?: string | null; email?: string | null; is_banned?: boolean } | null;
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      full_name: (row.full_name as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      city: (row.city as string | null) ?? null,
      state: (row.state as string | null) ?? null,
      preferred_roles: (row.preferred_roles as string[]) ?? [],
      verification_status: String(row.verification_status ?? "draft"),
      verified: Boolean(row.verified),
      verification_requested_at: (row.verification_requested_at as string | null) ?? null,
      updated_at: String(row.updated_at),
      user_name: user?.name ?? null,
      user_email: user?.email ?? null,
      user_banned: user?.is_banned ?? false,
    } satisfies AdminCandidateRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getEmployersPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("employer_profiles")
    .select(
      "id, user_id, company_id, company_name, recruiter_name, recruiter_phone, website, city, state, verified, approval_status, updated_at, users!employer_profiles_user_id_fkey(name, email)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(
      `company_name.ilike.${like},recruiter_name.ilike.${like},city.ilike.${like},state.ilike.${like},website.ilike.${like}`,
    );
  }

  if (state.status) {
    if (state.status === "verified") {
      query = query.eq("verified", true);
    } else {
      query = query.eq("approval_status", state.status);
    }
  }

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const user = row.users as { name?: string | null; email?: string | null } | null;
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      company_id: (row.company_id as string | null) ?? null,
      company_name: String(row.company_name),
      recruiter_name: (row.recruiter_name as string | null) ?? null,
      recruiter_phone: (row.recruiter_phone as string | null) ?? null,
      website: (row.website as string | null) ?? null,
      city: (row.city as string | null) ?? null,
      state: (row.state as string | null) ?? null,
      verified: Boolean(row.verified),
      approval_status: String(row.approval_status),
      updated_at: String(row.updated_at),
      user_name: user?.name ?? null,
      user_email: user?.email ?? null,
    } satisfies AdminEmployerRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getCompaniesPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("companies")
    .select("id, name, slug, industry, city, state, size_range, website, verified, rating, updated_at", {
      count: "exact",
    })
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`name.ilike.${like},industry.ilike.${like},city.ilike.${like},state.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("verified", state.status === "verified");
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminCompanyRow[] | null, result.count, state.page);
}

export async function getJobsPage(state: AdminQueryState) {
  await syncExpiredJobs();

  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("jobs")
    .select(
      "id, title, slug, category_slug, company_name, city, state, job_type, work_mode, source_type, approval_status, status, is_featured, created_at, deadline, published_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`title.ilike.${like},company_name.ilike.${like},city.ilike.${like},state.ilike.${like}`);
  }

  if (state.status) {
    if (["pending", "approved", "rejected"].includes(state.status)) {
      query = query.eq("approval_status", state.status);
    } else if (state.status === "featured") {
      query = query.eq("is_featured", true);
    } else {
      query = query.eq("status", state.status);
    }
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminJobRow[] | null, result.count, state.page);
}

export function parseJobReviewTab(value: string | string[] | undefined): AdminJobReviewTab {
  const parsed = parseValue(value).trim().toLowerCase();
  const tabs: AdminJobReviewTab[] = ["pending", "active", "rejected", "flagged", "expired"];
  return tabs.includes(parsed as AdminJobReviewTab) ? (parsed as AdminJobReviewTab) : "pending";
}

function applyJobReviewTabFilter<T extends ReviewFilterQuery<T>>(query: T, tab: AdminJobReviewTab): T {
  if (tab === "pending") {
    return query.or("approval_status.eq.pending,status.eq.pending");
  }

  if (tab === "active") {
    return query.eq("approval_status", "approved").eq("status", "active");
  }

  if (tab === "rejected") {
    return query.or("approval_status.eq.rejected,status.eq.rejected");
  }

  if (tab === "flagged") {
    return query.or("status.eq.flagged,is_suspicious.eq.true");
  }

  return query.eq("status", "expired");
}

export async function getJobsReviewPage(input: {
  tab: AdminJobReviewTab;
  q?: string;
  page?: number;
}) {
  await syncExpiredJobs();

  const client = await getDataClient();
  const page = input.page && input.page > 0 ? input.page : 1;
  const { from, to } = getRange(page);
  let query = client
    .from("jobs")
    .select(
      "id, slug, title, company_name, city, state, salary_min, salary_max, salary_type, experience_required, experience_min, experience_max, source_url, application_url, created_at, status, approval_status, is_featured, is_verified, is_suspicious, suspicious_flags, expires_at, published_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (input.q?.trim()) {
    const like = toLikePattern(input.q);
    query = query.or(
      `title.ilike.${like},company_name.ilike.${like},city.ilike.${like},state.ilike.${like},source_url.ilike.${like},application_url.ilike.${like}`,
    );
  }

  query = applyJobReviewTabFilter(query, input.tab);

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    company_name: String(row.company_name),
    city: (row.city as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    salary_min: typeof row.salary_min === "number" ? Number(row.salary_min) : null,
    salary_max: typeof row.salary_max === "number" ? Number(row.salary_max) : null,
    salary_type: (row.salary_type as string | null) ?? null,
    experience_required: (row.experience_required as string | null) ?? null,
    experience_min: typeof row.experience_min === "number" ? Number(row.experience_min) : null,
    experience_max: typeof row.experience_max === "number" ? Number(row.experience_max) : null,
    source_url: (row.source_url as string | null) ?? null,
    application_url: (row.application_url as string | null) ?? null,
    created_at: String(row.created_at),
    status: String(row.status),
    approval_status: String(row.approval_status),
    is_featured: Boolean(row.is_featured),
    is_verified: Boolean(row.is_verified),
    is_suspicious: Boolean(row.is_suspicious),
    suspicious_flags: Array.isArray(row.suspicious_flags)
      ? row.suspicious_flags.filter((value): value is string => typeof value === "string")
      : [],
    expires_at: (row.expires_at as string | null) ?? null,
    published_at: (row.published_at as string | null) ?? null,
  })) satisfies AdminJobReviewRow[];

  return buildPaginatedResult(rows, result.count, page);
}

export const getJobsReviewCounts = cache(async (): Promise<AdminJobReviewCounts> => {
  await syncExpiredJobs();

  const client = await getDataClient();

  const [pending, active, rejected, flagged, expired] = await Promise.all([
    client.from("jobs").select("*", { count: "exact", head: true }).or("approval_status.eq.pending,status.eq.pending"),
    client.from("jobs").select("*", { count: "exact", head: true }).eq("approval_status", "approved").eq("status", "active"),
    client.from("jobs").select("*", { count: "exact", head: true }).or("approval_status.eq.rejected,status.eq.rejected"),
    client.from("jobs").select("*", { count: "exact", head: true }).or("status.eq.flagged,is_suspicious.eq.true"),
    client.from("jobs").select("*", { count: "exact", head: true }).eq("status", "expired"),
  ]);

  return {
    pending: pending.count ?? 0,
    active: active.count ?? 0,
    rejected: rejected.count ?? 0,
    flagged: flagged.count ?? 0,
    expired: expired.count ?? 0,
  };
});

export async function getJobCategoryOptions() {
  const client = await getDataClient();
  const { data } = await client
    .from("job_categories")
    .select("slug, name, job_family")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (data as AdminJobCategoryRow[] | null) ?? [];
}

export async function getApplicationsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("applications")
    .select(
      "id, status, applied_at, updated_at, resume_id, resume_storage_path, resume_url, employer_notes, jobs!applications_job_id_fkey(title, company_name), candidate_profiles!applications_candidate_id_fkey(full_name, city, state)",
      { count: "exact" },
    )
    .order("applied_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`status.ilike.${like},employer_notes.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const job = row.jobs as { title?: string | null; company_name?: string | null } | null;
    const candidate = row.candidate_profiles as {
      full_name?: string | null;
      city?: string | null;
      state?: string | null;
    } | null;

    return {
      id: String(row.id),
      status: String(row.status),
      applied_at: String(row.applied_at),
      updated_at: String(row.updated_at),
      resume_id: (row.resume_id as string | null) ?? null,
      resume_storage_path: (row.resume_storage_path as string | null) ?? null,
      resume_url: (row.resume_url as string | null) ?? null,
      employer_notes: (row.employer_notes as string | null) ?? null,
      job_title: job?.title ?? null,
      company_name: job?.company_name ?? null,
      candidate_name: candidate?.full_name ?? null,
      candidate_city: candidate?.city ?? null,
      candidate_state: candidate?.state ?? null,
    } satisfies AdminApplicationRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getGovernmentJobsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("government_jobs")
    .select("id, title, slug, department, category, state, last_date, official_url, notification_url, official_apply_url, source_url, summary, status, updated_at", {
      count: "exact",
    })
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`title.ilike.${like},department.ilike.${like},category.ilike.${like},state.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminGovernmentJobRow[] | null, result.count, state.page);
}

export async function getInternshipsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("internships")
    .select("id, title, slug, company, stipend, duration, location, work_mode, deadline, is_paid, updated_at", {
      count: "exact",
    })
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`title.ilike.${like},company.ilike.${like},location.ilike.${like},duration.ilike.${like}`);
  }

  if (state.status) {
    if (state.status === "paid") {
      query = query.eq("is_paid", true);
    } else if (state.status === "unpaid") {
      query = query.eq("is_paid", false);
    } else {
      query = query.eq("work_mode", state.status);
    }
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminInternshipRow[] | null, result.count, state.page);
}

export async function getBlogPostsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("blog_posts")
    .select("id, title, slug, status, published_at, meta_title, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`title.ilike.${like},slug.ilike.${like},meta_title.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminBlogRow[] | null, result.count, state.page);
}

export async function getSeoPagesPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("seo_pages")
    .select("id, title, slug, page_type, city, state, category, indexable, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`title.ilike.${like},slug.ilike.${like},page_type.ilike.${like},city.ilike.${like},category.ilike.${like}`);
  }

  if (state.status) {
    if (state.status === "indexable") {
      query = query.eq("indexable", true);
    } else if (state.status === "noindex") {
      query = query.eq("indexable", false);
    } else {
      query = query.eq("page_type", state.status);
    }
  }

  const result = await query.range(from, to);
  return buildPaginatedResult(result.data as AdminSeoRow[] | null, result.count, state.page);
}

export async function getPaymentsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("payments")
    .select("id, amount, plan, subscription_type, status, razorpay_payment_id, created_at, users!payments_user_id_fkey(name, email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`plan.ilike.${like},subscription_type.ilike.${like},razorpay_payment_id.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const user = row.users as { name?: string | null; email?: string | null } | null;
    return {
      id: String(row.id),
      amount: Number(row.amount),
      plan: String(row.plan),
      subscription_type: (row.subscription_type as string | null) ?? null,
      status: String(row.status),
      razorpay_payment_id: (row.razorpay_payment_id as string | null) ?? null,
      created_at: String(row.created_at),
      user_name: user?.name ?? null,
      user_email: user?.email ?? null,
    } satisfies AdminPaymentRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getReportsPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("job_reports")
    .select(
      "id, job_id, reason, details, status, resolution_notes, created_at, updated_at, jobs!job_reports_job_id_fkey(id, title, company_name, employer_id, employer_profiles!jobs_employer_id_fkey(user_id)), users!job_reports_reported_by_fkey(name, email)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`reason.ilike.${like},details.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
    const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
      const job = row.jobs as {
        id?: string | null;
        title?: string | null;
        company_name?: string | null;
        employer_id?: string | null;
        employer_profiles?: { user_id?: string | null } | null;
      } | null;
      const user = row.users as { name?: string | null; email?: string | null } | null;
      return {
        id: String(row.id),
        job_id: (row.job_id as string | null) ?? job?.id ?? null,
        employer_id: job?.employer_id ?? null,
        employer_user_id: job?.employer_profiles?.user_id ?? null,
        reason: String(row.reason),
        details: (row.details as string | null) ?? null,
        status: String(row.status),
        resolution_notes: (row.resolution_notes as string | null) ?? null,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      job_title: job?.title ?? null,
      company_name: job?.company_name ?? null,
      reporter_name: user?.name ?? null,
      reporter_email: user?.email ?? null,
    } satisfies AdminReportRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getWhatsappPage(state: AdminQueryState) {
  const client = await getDataClient();
  const { from, to } = getRange(state.page);
  let query = client
    .from("whatsapp_subscriptions")
    .select(
      "id, phone_number, city, category_slug, status, is_opted_in, created_at, users!whatsapp_subscriptions_user_id_fkey(name, email)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`phone_number.ilike.${like},city.ilike.${like},category_slug.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("status", state.status);
  }

  const result = await query.range(from, to);
  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const user = row.users as { name?: string | null; email?: string | null } | null;
    return {
      id: String(row.id),
      phone_number: String(row.phone_number),
      city: (row.city as string | null) ?? null,
      category_slug: (row.category_slug as string | null) ?? null,
      status: String(row.status),
      is_opted_in: Boolean(row.is_opted_in),
      created_at: String(row.created_at),
      user_name: user?.name ?? null,
      user_email: user?.email ?? null,
    } satisfies AdminWhatsappRow;
  });

  return buildPaginatedResult(rows, result.count, state.page);
}

export async function getAiUsagePage(state: AdminQueryState) {
  const client = await getDataClient();
  const [resumeAnalyses, interviewSessions] = await Promise.all([
    client
      .from("resume_analyses")
      .select("id, score, match_score, job_description_text, created_at, users!resume_analyses_user_id_fkey(name, email)")
      .order("created_at", { ascending: false })
      .limit(120),
    client
      .from("interview_sessions")
      .select("id, role, mode, score, created_at, users!interview_sessions_user_id_fkey(name, email)")
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const rows: AdminAiUsageRow[] = [
    ...(((resumeAnalyses.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
      const user = row.users as { name?: string | null; email?: string | null } | null;
      return {
        id: String(row.id),
        kind: "resume-analysis" as const,
        actor: user?.name ?? user?.email ?? "Unknown user",
        subject: (row.job_description_text as string | null)?.slice(0, 42) || "Resume optimization",
        created_at: String(row.created_at),
        score:
          typeof row.match_score === "number"
            ? Number(row.match_score)
            : typeof row.score === "number"
              ? Number(row.score)
              : null,
        detail: "ATS and keyword matching insight",
      };
    })),
    ...(((interviewSessions.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
      const user = row.users as { name?: string | null; email?: string | null } | null;
      return {
        id: String(row.id),
        kind: "interview-session" as const,
        actor: user?.name ?? user?.email ?? "Unknown user",
        subject: `${String(row.role ?? "Interview")} (${String(row.mode ?? "practice")})`,
        created_at: String(row.created_at),
        score: typeof row.score === "number" ? Number(row.score) : null,
        detail: "AI-generated interview coaching session",
      };
    })),
  ]
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .filter((row) => {
      if (!state.q) return true;
      const haystack = `${row.actor} ${row.subject} ${row.detail}`.toLowerCase();
      return haystack.includes(state.q.toLowerCase());
    })
    .filter((row) => (state.status ? row.kind === state.status : true));

  const start = (state.page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    rows: rows.slice(start, end),
    total: rows.length,
    page: state.page,
    pageSize: PAGE_SIZE,
  } satisfies PaginatedResult<AdminAiUsageRow>;
}

export async function getAnalyticsPage(state: AdminQueryState) {
  const client = await getDataClient();
  let query = client
    .from("analytics_events")
    .select("id, event_name, session_id, event_data, created_at, users!analytics_events_user_id_fkey(name, email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (state.q) {
    const like = toLikePattern(state.q);
    query = query.or(`event_name.ilike.${like},session_id.ilike.${like}`);
  }

  if (state.status) {
    query = query.eq("event_name", state.status);
  }

  const { from, to } = getRange(state.page);
  const result = await query.range(from, to);

  const rows = ((result.data as Array<Record<string, unknown>> | null) ?? []).map((row) => {
    const user = row.users as { name?: string | null; email?: string | null } | null;
    const eventData = row.event_data as Record<string, unknown> | null;
    return {
      id: String(row.id),
      event_name: String(row.event_name),
      session_id: (row.session_id as string | null) ?? null,
      created_at: String(row.created_at),
      user_name: user?.name ?? null,
      user_email: user?.email ?? null,
      detail: eventData ? JSON.stringify(eventData).slice(0, 100) : "{}",
    } satisfies AdminAnalyticsRow;
  });

  const [summarySource, usersCount, jobsCount, applicationsCount, paymentsSource, resumeAnalysesCount, interviewSessionsCount, careerAgentUsageCount, whatsappCount, citiesSource, rolesSource] =
    await Promise.all([
      client.from("analytics_events").select("event_name").order("created_at", { ascending: false }).limit(500),
      client.from("users").select("*", { count: "exact", head: true }),
      client.from("jobs").select("*", { count: "exact", head: true }),
      client.from("applications").select("*", { count: "exact", head: true }),
      client.from("payments").select("amount, status"),
      client.from("resume_analyses").select("*", { count: "exact", head: true }),
      client.from("interview_sessions").select("*", { count: "exact", head: true }),
      client.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "ai_career_agent_used"),
      client.from("whatsapp_subscriptions").select("*", { count: "exact", head: true }).eq("is_opted_in", true),
      client.from("candidate_profiles").select("city").not("city", "is", null).limit(500),
      client.from("jobs").select("title").not("title", "is", null).limit(500),
    ]);

  const counter = new Map<string, number>();
  for (const item of summarySource.data ?? []) {
    const name = String((item as { event_name?: string }).event_name ?? "unknown");
    counter.set(name, (counter.get(name) ?? 0) + 1);
  }

  const revenue = ((paymentsSource.data as Array<{ amount?: number; status?: string }> | null) ?? []).reduce(
    (sum, payment) => (payment.status === "paid" ? sum + Number(payment.amount ?? 0) : sum),
    0,
  );

  const summary: AdminAnalyticsSummary = {
    totalUsers: usersCount.count ?? 0,
    totalJobs: jobsCount.count ?? 0,
    totalApplications: applicationsCount.count ?? 0,
    revenue,
    aiUsage:
      (resumeAnalysesCount.count ?? 0) +
      (interviewSessionsCount.count ?? 0) +
      (careerAgentUsageCount.count ?? 0),
    whatsappSubscriptions: whatsappCount.count ?? 0,
    topCities: buildTopCounts(
      ((citiesSource.data as Array<{ city?: string | null }> | null) ?? []).map((item) => item.city ?? null),
    ),
    topRoles: buildTopCounts(
      ((rolesSource.data as Array<{ title?: string | null }> | null) ?? []).map((item) => item.title ?? null),
    ),
    topEvents: [...counter.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
  };

  return {
    table: buildPaginatedResult(rows, result.count, state.page),
    summary,
  };
}
