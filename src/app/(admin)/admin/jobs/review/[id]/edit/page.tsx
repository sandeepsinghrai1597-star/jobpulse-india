import { notFound } from "next/navigation";
import { updateAdminJobFormAction } from "@/app/(admin)/admin/actions";
import {
  AdminJobEditForm,
  type AdminJobFormValues,
} from "@/components/admin/admin-job-create-form";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function joinList(value: string[] | null) {
  return (value ?? []).join("\n");
}

function asDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = getSupabaseAdminClient();
  const { id } = await params;

  if (!admin) {
    notFound();
  }

  const { data } = await admin
    .from("jobs")
    .select(
      "id, category_slug, title, company_name, description, responsibilities, requirements, skills, salary_min, salary_max, salary_type, city, state, country, work_mode, job_type, education_required, experience_required, experience_min, experience_max, industry, openings, deadline, application_url, source_url, source_type, recruiter_contact, no_candidate_payment, salary_disclosed, government_source_verified, is_featured, is_verified, company_id, companies(name, website, description, logo_url, is_verified)",
    )
    .eq("id", id)
    .maybeSingle();

  const job = data as {
    id: string;
    category_slug: string | null;
    title: string;
    company_name: string;
    description: string;
    responsibilities: string[] | null;
    requirements: string[] | null;
    skills: string[] | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_type: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    work_mode: "remote" | "hybrid" | "onsite" | null;
    job_type: "full-time" | "part-time" | "contract" | "freelance" | "internship" | "walk-in" | null;
    education_required: string | null;
    experience_required: string | null;
    experience_min: number | null;
    experience_max: number | null;
    industry: string | null;
    openings: number | null;
    deadline: string | null;
    application_url: string | null;
    source_url: string | null;
    source_type: "admin" | "official" | "partner" | "employer" | null;
    recruiter_contact: string | null;
    no_candidate_payment: boolean | null;
    salary_disclosed: boolean | null;
    government_source_verified: boolean | null;
    is_featured: boolean | null;
    is_verified: boolean | null;
    companies?: {
      name?: string | null;
      website?: string | null;
      description?: string | null;
      logo_url?: string | null;
      is_verified?: boolean | null;
    } | null;
  } | null;

  if (!job) {
    notFound();
  }

  const initialValues: Partial<AdminJobFormValues> = {
    categorySlug: job.category_slug ?? "",
    companyName: job.company_name ?? job.companies?.name ?? "",
    companyWebsite: job.companies?.website ?? "",
    companyDescription: job.companies?.description ?? "",
    companyLogoUrl: job.companies?.logo_url ?? "",
    companyVerified: Boolean(job.companies?.is_verified),
    title: job.title ?? "",
    description: job.description ?? "",
    responsibilities: joinList(job.responsibilities),
    requirements: joinList(job.requirements),
    skills: joinList(job.skills),
    city: job.city ?? "",
    state: job.state ?? "",
    country: job.country ?? "India",
    workMode: job.work_mode ?? "onsite",
    jobType: job.job_type ?? "full-time",
    salaryType: job.salary_type === "monthly" || job.salary_type === "stipend" ? job.salary_type : "yearly",
    educationRequired: job.education_required ?? "",
    experienceRequired: job.experience_required ?? "",
    experienceMin: job.experience_min != null ? String(job.experience_min) : "",
    experienceMax: job.experience_max != null ? String(job.experience_max) : "",
    industry: job.industry ?? "",
    openings: String(job.openings ?? 1),
    deadline: asDateInput(job.deadline),
    salaryMin: String(job.salary_min ?? 0),
    salaryMax: String(job.salary_max ?? 0),
    applicationUrl: job.application_url ?? "",
    sourceUrl: job.source_url ?? "",
    sourceType: job.source_type ?? "admin",
    recruiterContact: job.recruiter_contact ?? "",
    noCandidatePayment: job.no_candidate_payment ?? true,
    salaryDisclosed: job.salary_disclosed ?? true,
    governmentSourceVerified: job.government_source_verified ?? false,
    featured: job.is_featured ?? false,
    verified: job.is_verified ?? false,
  };

  return (
    <DashboardShell
      role="admin"
      title="Edit reviewed job"
      description="Adjust listing content, trust labels, and publishing metadata before the next moderation action."
    >
      <AdminJobEditForm
        action={updateAdminJobFormAction.bind(null, id)}
        initialValues={initialValues}
      />
    </DashboardShell>
  );
}
