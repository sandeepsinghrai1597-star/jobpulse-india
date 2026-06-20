import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { getEmployerAccess } from "@/lib/employer/access";
import { employerJobSchema } from "@/lib/validation/schemas";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildSuspiciousFlags(input: {
  noCandidatePayment: boolean;
  salaryDisclosed: boolean;
  governmentSourceVerified: boolean;
  industry: string;
  title: string;
}) {
  const flags: string[] = [];

  if (!input.noCandidatePayment) flags.push("payment-demand-risk");
  if (!input.salaryDisclosed) flags.push("salary-undisclosed");

  const looksGovernment =
    `${input.title} ${input.industry}`.toLowerCase().includes("government") ||
    `${input.title} ${input.industry}`.toLowerCase().includes("public sector");

  if (looksGovernment && !input.governmentSourceVerified) {
    flags.push("unverified-government-source");
  }

  return flags;
}

export async function POST(request: Request) {
  const access = await getEmployerAccess();
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const body = await request.json();
  const parsed = employerJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Please fix the highlighted job details.",
        error: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const slugBase = slugify(`${parsed.data.title}-${parsed.data.city}`);
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
  const approvalDisabled = process.env.ADMIN_APPROVAL_DISABLED === "true";
  const autoApprove = approvalDisabled || access.user.role === "admin";
  const suspiciousFlags = buildSuspiciousFlags(parsed.data);

  const { data, error } = await access.admin
    .from("jobs")
    .insert({
      employer_id: access.employerProfileId,
      title: parsed.data.title,
      slug,
      company_name: parsed.data.companyName || access.companyName,
      description: parsed.data.description,
      responsibilities: parsed.data.responsibilities,
      requirements: parsed.data.requirements,
      skills: parsed.data.skills,
      salary_min: parsed.data.salaryMin,
      salary_max: parsed.data.salaryMax,
      salary_type: "yearly",
      city: parsed.data.city,
      state: parsed.data.state,
      country: "India",
      job_type: parsed.data.jobType,
      work_mode: parsed.data.workMode,
      education_required: parsed.data.educationRequired,
      experience_required: parsed.data.experienceRequired,
      industry: parsed.data.industry,
      openings: parsed.data.openings,
      no_candidate_payment: parsed.data.noCandidatePayment,
      salary_disclosed: parsed.data.salaryDisclosed,
      government_source_verified: parsed.data.governmentSourceVerified,
      suspicious_flags: suspiciousFlags,
      is_suspicious: suspiciousFlags.length > 0,
      deadline: parsed.data.deadline,
      status: autoApprove ? "active" : "pending",
      approval_status: autoApprove ? "approved" : "pending",
      application_url: parsed.data.applicationUrl || null,
      source_type: "employer",
      updated_at: new Date().toISOString(),
    } as never)
    .select("id, slug")
    .single();
  const createdJob = data as { id: string; slug: string } | null;

  if (error) {
    return NextResponse.json({ message: "We could not create the job post." }, { status: 500 });
  }

  await recordAnalyticsEvent({
    userId: access.user.id,
    employerId: access.employerProfileId,
    jobId: createdJob?.id ?? null,
    eventName: "employer_job_post",
    eventData: {
      title: parsed.data.title,
      city: parsed.data.city,
      state: parsed.data.state,
      workMode: parsed.data.workMode,
      jobType: parsed.data.jobType,
      approvalStatus: autoApprove ? "approved" : "pending",
    },
  });

  return NextResponse.json({
    ok: true,
    job: createdJob,
    message:
      autoApprove
        ? "Job published successfully."
        : "Job submitted successfully and is pending review.",
  });
}

export async function GET() {
  const access = await getEmployerAccess();
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const { data, error } = await access.admin
    .from("jobs")
    .select("id, title, city, state, status, approval_status, is_featured, openings, deadline, salary_min, salary_max, updated_at")
    .eq("employer_id", access.employerProfileId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "We could not load your jobs." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, jobs: data ?? [] });
}
