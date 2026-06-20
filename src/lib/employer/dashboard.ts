import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type EmployerJobRow = {
  id: string;
  title: string;
  company_name: string;
  city: string | null;
  state: string | null;
  status: string;
  approval_status: string;
  is_featured: boolean;
  openings: number;
  deadline: string | null;
  salary_min: number | null;
  salary_max: number | null;
  work_mode: string | null;
  job_type: string | null;
  updated_at: string;
};

export type EmployerApplicationRow = {
  id: string;
  status: string;
  applied_at: string;
  resume_url: string | null;
  employer_notes: string | null;
  jobs: {
    id: string;
    title: string;
    employer_id: string | null;
  } | null;
  candidate_profiles: {
    full_name: string | null;
    headline: string | null;
    city: string | null;
    state: string | null;
    skills: string[] | null;
    experience: string | null;
    education: string | null;
    resume_url: string | null;
  } | null;
};

export type EmployerProfileSummary = {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  recruiter_name: string | null;
  recruiter_phone: string | null;
  verified: boolean;
  approval_status: string;
};

type LatestPaymentRow = {
  plan: string;
  status: string;
  subscription_type: string | null;
  updated_at: string;
};

export type EmployerAnalyticsItem = {
  label: string;
  count: number;
};

export type EmployerJobAnalyticsRow = {
  id: string;
  title: string;
  is_featured: boolean;
  views: number;
  applications: number;
  applyRate: string;
  applicantLocations: string[];
  applicantSkills: string[];
};

export type EmployerAnalyticsSummary = {
  activeJobs: number;
  totalViews: number;
  totalApplications: number;
  applyRate: string;
  applicantLocations: EmployerAnalyticsItem[];
  applicantSkills: EmployerAnalyticsItem[];
  jobs: EmployerJobAnalyticsRow[];
};

export async function getEmployerDashboardData() {
  const user = await getCurrentUser();
  const admin = getSupabaseAdminClient();

  if (!user || !admin) {
    return { profile: null, jobs: [], applications: [], payments: [] };
  }

  const { data: profile } = await admin
    .from("employer_profiles")
    .select("id, company_name, website, industry, city, state, recruiter_name, recruiter_phone, verified, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const employerProfile = profile as EmployerProfileSummary | null;

  if (!employerProfile?.id) {
    return { profile: null, jobs: [], applications: [], payments: [] };
  }

  const [jobsResult, applicationsResult, paymentsResult] = await Promise.all([
    admin
      .from("jobs")
      .select("id, title, company_name, city, state, status, approval_status, is_featured, openings, deadline, salary_min, salary_max, work_mode, job_type, updated_at")
      .eq("employer_id", employerProfile.id)
      .order("updated_at", { ascending: false }),
    admin
      .from("applications")
      .select("id, status, applied_at, resume_url, employer_notes, jobs!inner(id, title, employer_id), candidate_profiles(full_name, headline, city, state, skills, experience, education, resume_url)")
      .eq("jobs.employer_id", employerProfile.id)
      .order("updated_at", { ascending: false }),
    admin
      .from("payments")
      .select("plan, status, subscription_type, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  return {
    profile: employerProfile,
    jobs: ((jobsResult.data ?? []) as unknown) as EmployerJobRow[],
    applications: ((applicationsResult.data ?? []) as unknown) as EmployerApplicationRow[],
    payments: ((paymentsResult.data ?? []) as unknown) as LatestPaymentRow[],
  };
}

export function getEmployerStats(jobs: EmployerJobRow[], applications: EmployerApplicationRow[]) {
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const pendingJobs = jobs.filter((job) => job.status === "pending" || job.approval_status === "pending").length;
  const shortlisted = applications.filter((application) => application.status === "shortlisted").length;
  const featuredJobs = jobs.filter((job) => job.is_featured).length;
  const viewsEstimate = Math.max(240, jobs.length * 210 + applications.length * 18);
  const applyRate = viewsEstimate > 0 ? ((applications.length / viewsEstimate) * 100).toFixed(1) : "0.0";

  return {
    activeJobs,
    pendingJobs,
    shortlisted,
    featuredJobs,
    applicants: applications.length,
    viewsEstimate,
    applyRate,
    shortlistRate:
      applications.length > 0 ? ((shortlisted / applications.length) * 100).toFixed(1) : "0.0",
  };
}

function buildTopItems(values: Array<string | null | undefined>, limit = 6) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function getEmployerAnalytics(): Promise<EmployerAnalyticsSummary> {
  const { profile, jobs, applications } = await getEmployerDashboardData();

  if (!profile?.id || jobs.length === 0) {
    return {
      activeJobs: 0,
      totalViews: 0,
      totalApplications: applications.length,
      applyRate: "0.0",
      applicantLocations: [],
      applicantSkills: [],
      jobs: [],
    };
  }

  const admin = getSupabaseAdminClient();
  const jobIds = jobs.map((job) => job.id);
  const jobViewsById = new Map<string, number>();

  if (admin && jobIds.length > 0) {
    const { data } = await admin
      .from("analytics_events")
      .select("job_id")
      .eq("event_name", "job_view")
      .in("job_id", jobIds);

    for (const row of data ?? []) {
      const jobId = (row as { job_id?: string | null }).job_id;
      if (!jobId) continue;
      jobViewsById.set(jobId, (jobViewsById.get(jobId) ?? 0) + 1);
    }
  }

  const applicationsByJobId = new Map<string, EmployerApplicationRow[]>();
  for (const application of applications) {
    const jobId = application.jobs?.id;
    if (!jobId) continue;
    const bucket = applicationsByJobId.get(jobId) ?? [];
    bucket.push(application);
    applicationsByJobId.set(jobId, bucket);
  }

  const totalViews = [...jobViewsById.values()].reduce((sum, value) => sum + value, 0);
  const totalApplications = applications.length;

  return {
    activeJobs: jobs.filter((job) => job.status === "active").length,
    totalViews,
    totalApplications,
    applyRate: totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : "0.0",
    applicantLocations: buildTopItems(
      applications.map((application) => {
        const city = application.candidate_profiles?.city?.trim();
        const state = application.candidate_profiles?.state?.trim();
        return [city, state].filter(Boolean).join(", ") || null;
      }),
    ),
    applicantSkills: buildTopItems(
      applications.flatMap((application) => application.candidate_profiles?.skills ?? []),
    ),
    jobs: jobs.map((job) => {
      const jobApplications = applicationsByJobId.get(job.id) ?? [];
      const views = jobViewsById.get(job.id) ?? 0;

      return {
        id: job.id,
        title: job.title,
        is_featured: job.is_featured,
        views,
        applications: jobApplications.length,
        applyRate: views > 0 ? ((jobApplications.length / views) * 100).toFixed(1) : "0.0",
        applicantLocations: buildTopItems(
          jobApplications.map((application) => {
            const city = application.candidate_profiles?.city?.trim();
            const state = application.candidate_profiles?.state?.trim();
            return [city, state].filter(Boolean).join(", ") || null;
          }),
          3,
        ).map((item) => item.label),
        applicantSkills: buildTopItems(
          jobApplications.flatMap((application) => application.candidate_profiles?.skills ?? []),
          4,
        ).map((item) => item.label),
      } satisfies EmployerJobAnalyticsRow;
    }),
  };
}
