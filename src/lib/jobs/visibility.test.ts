import type { Job } from "@/types";
import { searchPublicJobs } from "@/lib/jobs/public-search";
import {
  filterVisibleJobRows,
  getPublicJobWindow,
  isPublicJobObjectVisible,
  isPublicJobVisible,
} from "@/lib/jobs/visibility";
import type { SupabaseJobRow } from "@/lib/jobs/live";

const NOW = new Date("2026-06-20T12:00:00.000Z");

function buildJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    slug: "visible-job",
    categorySlug: "it-jobs",
    title: "Visible Job",
    companyName: "JobPulse",
    companyLogo: "JP",
    description: "Backend role",
    responsibilities: [],
    requirements: [],
    skills: ["TypeScript"],
    salaryMin: 400000,
    salaryMax: 700000,
    salaryType: "yearly",
    location: "Delhi, Delhi",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    workMode: "hybrid",
    experienceRequired: "1-3 years",
    educationRequired: "B.Tech",
    jobType: "full-time",
    industry: "Software",
    openings: 1,
    applicationDeadline: "2026-06-30",
    recruiterContact: "",
    applicationUrl: "/jobs/visible-job",
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
    status: "active",
    ...overrides,
  };
}

function buildRow(overrides: Partial<SupabaseJobRow> = {}): SupabaseJobRow {
  return {
    id: "row-1",
    slug: "visible-row",
    category_slug: "it-jobs",
    title: "Visible Row",
    company_name: "JobPulse",
    description: "Backend role",
    responsibilities: [],
    requirements: [],
    skills: ["TypeScript"],
    salary_min: 400000,
    salary_max: 700000,
    salary_type: "yearly",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    job_type: "full-time",
    work_mode: "hybrid",
    education_required: "B.Tech",
    experience_required: "1-3 years",
    experience_min: 1,
    experience_max: 3,
    industry: "Software",
    openings: 1,
    recruiter_contact: "",
    status: "active",
    approval_status: "approved",
    no_candidate_payment: true,
    salary_disclosed: true,
    government_source_verified: false,
    suspicious_flags: [],
    is_suspicious: false,
    moderation_notes: null,
    is_featured: false,
    application_url: "/jobs/visible-row",
    apply_url: "/jobs/visible-row",
    deadline: "2026-06-30",
    expires_at: `${getPublicJobWindow(NOW).todayDate}T23:59:59.000+05:30`,
    source_type: "admin",
    source_url: "https://example.com/jobs/visible-row",
    created_at: "2026-06-18T00:00:00.000Z",
    updated_at: "2026-06-19T00:00:00.000Z",
    published_at: "2026-06-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("job visibility", () => {
  it("keeps active jobs visible when deadline and expiry are still open", () => {
    expect(
      isPublicJobVisible(
        {
          status: "active",
          deadline: "2026-06-20",
          expires_at: "2026-06-20T23:59:59.000+05:30",
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("suppresses jobs with a past deadline or past expiry timestamp", () => {
    expect(
      isPublicJobVisible(
        {
          status: "active",
          deadline: "2026-06-19",
          expires_at: null,
        },
        NOW,
      ),
    ).toBe(false);

    expect(
      isPublicJobVisible(
        {
          status: "active",
          deadline: null,
          expires_at: "2026-06-19T23:59:59.000+05:30",
        },
        NOW,
      ),
    ).toBe(false);
  });

  it("allows null deadline and null expiry for active jobs", () => {
    expect(
      isPublicJobVisible(
        {
          status: "active",
          deadline: null,
          expires_at: null,
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("filters stale database rows before they reach public pages", () => {
    const visibleRows = filterVisibleJobRows(
      [
        buildRow({ id: "visible" }),
        buildRow({ id: "expired-deadline", deadline: "2026-06-19" }),
        buildRow({ id: "expired-expires-at", expires_at: "2026-06-19T12:00:00.000+05:30" }),
      ],
      NOW,
    );

    expect(visibleRows.map((row) => row.id)).toEqual(["visible"]);
  });

  it("keeps search results and counts free of stale active jobs", async () => {
    const visibleJob = buildJob({
      id: "visible",
      slug: "visible",
      title: "Visible backend job",
      applicationDeadline: "2999-12-31",
    });
    const expiredByDeadline = buildJob({
      id: "expired-deadline",
      slug: "expired-deadline",
      title: "Expired backend job",
      applicationDeadline: "2000-01-01",
    });
    const expiredByStatus = buildJob({
      id: "expired-status",
      slug: "expired-status",
      title: "Expired status job",
      status: "expired",
    });

    const result = await searchPublicJobs(
      {
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
      },
      [visibleJob, expiredByDeadline, expiredByStatus],
    );

    expect(isPublicJobObjectVisible(visibleJob, NOW)).toBe(true);
    expect(result.activeCount).toBe(1);
    expect(result.total).toBe(1);
    expect(result.results.map((job) => job.id)).toEqual(["visible"]);
  });
});
