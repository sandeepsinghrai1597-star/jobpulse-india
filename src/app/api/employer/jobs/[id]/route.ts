import { NextResponse } from "next/server";
import { assertOwnJob } from "@/lib/employer/access";
import { employerJobSchema } from "@/lib/validation/schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const allowedStatuses = new Set(["draft", "pending", "active", "expired", "rejected"]);

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

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await assertOwnJob(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const body = await request.json();
  const now = new Date().toISOString();

  if (body.action === "pause") {
    const { error } = await access.admin
      .from("jobs")
      .update({ status: "draft", updated_at: now } as never)
      .eq("id", id)
      .eq("employer_id", access.employerProfileId);

    if (error) {
      return NextResponse.json({ message: "We could not pause this job." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Job paused successfully." });
  }

  if (body.action === "resume") {
    const approvalDisabled = process.env.ADMIN_APPROVAL_DISABLED === "true";
    const autoApprove = approvalDisabled || access.user.role === "admin";
    const { error } = await access.admin
      .from("jobs")
      .update({
        status: autoApprove ? "active" : "pending",
        approval_status: autoApprove ? "approved" : "pending",
        updated_at: now,
      } as never)
      .eq("id", id)
      .eq("employer_id", access.employerProfileId);

    if (error) {
      return NextResponse.json({ message: "We could not resume this job." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: autoApprove ? "Job resumed successfully." : "Job sent back for approval.",
    });
  }

  if (body.action === "feature") {
    const { error } = await access.admin
      .from("jobs")
      .update({ is_featured: true, updated_at: now } as never)
      .eq("id", id)
      .eq("employer_id", access.employerProfileId);

    if (error) {
      return NextResponse.json({ message: "We could not feature this job." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Featured job request applied." });
  }

  if (body.status && allowedStatuses.has(body.status)) {
    const { error } = await access.admin
      .from("jobs")
      .update({ status: body.status, updated_at: now } as never)
      .eq("id", id)
      .eq("employer_id", access.employerProfileId);

    if (error) {
      return NextResponse.json({ message: "We could not update this job status." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Job status updated." });
  }

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

  const approvalDisabled = process.env.ADMIN_APPROVAL_DISABLED === "true";
  const autoApprove = approvalDisabled || access.user.role === "admin";
  const suspiciousFlags = buildSuspiciousFlags(parsed.data);
  const { error } = await access.admin
    .from("jobs")
    .update({
      title: parsed.data.title,
      company_name: parsed.data.companyName || access.companyName,
      description: parsed.data.description,
      responsibilities: parsed.data.responsibilities,
      requirements: parsed.data.requirements,
      skills: parsed.data.skills,
      salary_min: parsed.data.salaryMin,
      salary_max: parsed.data.salaryMax,
      city: parsed.data.city,
      state: parsed.data.state,
      work_mode: parsed.data.workMode,
      job_type: parsed.data.jobType,
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
      updated_at: now,
    } as never)
    .eq("id", id)
    .eq("employer_id", access.employerProfileId);

  if (error) {
    return NextResponse.json({ message: "We could not update this job." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: autoApprove ? "Job updated successfully." : "Job updated and sent for approval.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const access = await assertOwnJob(id);

  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const { error } = await access.admin
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("employer_id", access.employerProfileId);

  if (error) {
    return NextResponse.json({ message: "We could not delete this job." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Job deleted successfully." });
}
