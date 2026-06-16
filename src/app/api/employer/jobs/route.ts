import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { employerJobSchema } from "@/lib/validation/schemas";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "employer" && user.role !== "admin")) {
    return NextResponse.json({ message: "Only employers can post jobs." }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { message: "Supabase admin configuration is required to create jobs." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const parsed = employerJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: employerProfile } = await admin
    .from("employer_profiles")
    .upsert(
      {
        user_id: user.id,
        company_name: parsed.data.companyName,
        city: parsed.data.city,
        state: parsed.data.state,
      } as never,
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  const slugBase = slugify(`${parsed.data.title}-${parsed.data.city}`);
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

  const { data, error } = await admin
    .from("jobs")
    .insert({
      employer_id: (employerProfile as { id: string } | null)?.id ?? null,
      title: parsed.data.title,
      slug,
      company_name: parsed.data.companyName,
      description: parsed.data.description,
      responsibilities: [],
      requirements: [],
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
      status: "active",
      approval_status: user.role === "admin" ? "approved" : "pending",
      application_url: parsed.data.applicationUrl,
      source_type: "employer",
      updated_at: new Date().toISOString(),
    } as never)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ message: "We could not create the job post." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    job: data,
    message:
      user.role === "admin"
        ? "Job published successfully."
        : "Job submitted successfully and is pending review.",
  });
}
