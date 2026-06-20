import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { dbRowToJob, type SupabaseJobRow } from "@/lib/jobs/live";
import { getUnifiedJobByIdentifier } from "@/lib/jobs/live";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const admin = getSupabaseAdminClient();
  if (!admin) {
    const job = await getUnifiedJobByIdentifier(identifier);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  }

  // Try by slug first, then by id
  let { data, error } = await admin
    .from("jobs")
    .select(
      "id, slug, category_slug, title, company_name, description, responsibilities, requirements, skills, salary_min, salary_max, salary_type, city, state, country, job_type, work_mode, education_required, experience_required, industry, openings, recruiter_contact, status, approval_status, no_candidate_payment, salary_disclosed, government_source_verified, suspicious_flags, is_suspicious, moderation_notes, is_featured, application_url, deadline, source_type, source_url, created_at, updated_at, published_at",
    )
    .eq("slug", identifier)
    .eq("source_type", "admin")
    .eq("approval_status", "approved")
    .eq("status", "active")
    .maybeSingle();

  if (!data && !error) {
    const resById = await admin
      .from("jobs")
      .select(
        "id, slug, category_slug, title, company_name, description, responsibilities, requirements, skills, salary_min, salary_max, salary_type, city, state, country, job_type, work_mode, education_required, experience_required, industry, openings, recruiter_contact, status, approval_status, no_candidate_payment, salary_disclosed, government_source_verified, suspicious_flags, is_suspicious, moderation_notes, is_featured, application_url, deadline, source_type, source_url, created_at, updated_at, published_at",
      )
      .eq("id", identifier)
      .eq("source_type", "admin")
      .eq("approval_status", "approved")
      .eq("status", "active")
      .maybeSingle();
    data = resById.data;
    error = resById.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const job = dbRowToJob(data as SupabaseJobRow);
  return NextResponse.json(job);
}
