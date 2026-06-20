import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { JobPostForm } from "@/components/employer/job-post-form";
import type { EmployerJobFormValues } from "@/components/employer/job-post-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

type EmployerProfileLookup = {
  id: string;
};

type EditableJobRow = {
  id: string;
  title: string;
  company_name: string;
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  skills: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  city: string | null;
  state: string | null;
  work_mode: string | null;
  job_type: string | null;
  education_required: string | null;
  experience_required: string | null;
  industry: string | null;
  openings: number | null;
  deadline: string | null;
  application_url: string | null;
  no_candidate_payment: boolean | null;
  salary_disclosed: boolean | null;
  government_source_verified: boolean | null;
};

export default async function EditEmployerJobPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const admin = getSupabaseAdminClient();

  if (!user || !admin) {
    notFound();
  }

  const { data: profile } = await admin
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const employerProfile = profile as EmployerProfileLookup | null;

  if (!employerProfile?.id) {
    notFound();
  }

  const { data: job } = await admin
    .from("jobs")
    .select("id, title, company_name, description, responsibilities, requirements, skills, salary_min, salary_max, city, state, work_mode, job_type, education_required, experience_required, industry, openings, deadline, application_url, no_candidate_payment, salary_disclosed, government_source_verified")
    .eq("id", id)
    .eq("employer_id", employerProfile.id)
    .maybeSingle();

  const editableJob = job as EditableJobRow | null;

  if (!editableJob) {
    notFound();
  }

  const initialJob: EmployerJobFormValues = {
    companyName: editableJob.company_name ?? "",
    title: editableJob.title ?? "",
    description: editableJob.description ?? "",
    responsibilities: (editableJob.responsibilities ?? []).join("\n"),
    requirements: (editableJob.requirements ?? []).join("\n"),
    skills: (editableJob.skills ?? []).join("\n"),
    salaryMin: String(editableJob.salary_min ?? 0),
    salaryMax: String(editableJob.salary_max ?? 0),
    city: editableJob.city ?? "",
    state: editableJob.state ?? "",
    workMode: (editableJob.work_mode ?? "onsite") as EmployerJobFormValues["workMode"],
    jobType: (editableJob.job_type ?? "full-time") as EmployerJobFormValues["jobType"],
    educationRequired: editableJob.education_required ?? "",
    experienceRequired: editableJob.experience_required ?? "",
    industry: editableJob.industry ?? "",
    openings: String(editableJob.openings ?? 1),
    deadline: editableJob.deadline ?? "",
    applicationUrl: editableJob.application_url ?? "",
    noCandidatePayment: editableJob.no_candidate_payment ?? true,
    salaryDisclosed: editableJob.salary_disclosed ?? true,
    governmentSourceVerified: editableJob.government_source_verified ?? false,
  };

  return (
    <DashboardShell
      role="employer"
      title="Edit job"
      description="Update job content, compensation, deadline, skills, and hiring requirements."
    >
      <JobPostForm jobId={id} initialJob={initialJob} />
    </DashboardShell>
  );
}
