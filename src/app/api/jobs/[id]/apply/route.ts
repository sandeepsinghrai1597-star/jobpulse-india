import { NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import { mapCandidateProfileRow } from "@/lib/candidate/profile";
import { getUnifiedJobByIdentifier, jobToDbRow } from "@/lib/jobs/live";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const profileSelect = `
  id,
  user_id,
  full_name,
  phone,
  headline,
  bio,
  education,
  skills,
  experience,
  city,
  state,
  preferred_roles,
  expected_salary,
  preferred_job_types,
  language_preference,
  resume_url,
  verified,
  verification_status,
  verification_requested_at,
  verified_at,
  updated_at
`;

async function resolvePersistedJobId(identifier: string) {
  const unifiedJob = await getUnifiedJobByIdentifier(identifier);
  if (!unifiedJob) {
    return { id: null, job: null, message: "Job not found." };
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return {
      id: null,
      job: unifiedJob,
      message:
        "This environment is missing the service role key required to persist discovered jobs.",
    };
  }

  const result = await admin
    .from("jobs")
    .upsert(jobToDbRow(unifiedJob) as never, { onConflict: "slug" })
    .select("id")
    .single();
  const data = result.data as { id: string } | null;
  const error = result.error;

  if (error || !data?.id) {
    return {
      id: null,
      job: unifiedJob,
      message: "We could not prepare this job for verified applications.",
    };
  }

  return { id: data.id as string, job: unifiedJob, message: null };
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in as a candidate to apply." },
      { status: 401 },
    );
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("candidate_profiles")
    .select(profileSelect)
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { message: "We could not verify your candidate profile right now." },
      { status: 500 },
    );
  }

  const profile = mapCandidateProfileRow(profileRow);

  if (!profile.id) {
    return NextResponse.json(
      {
        message: "Complete your candidate profile before applying.",
        redirectTo: "/dashboard/profile",
      },
      { status: 403 },
    );
  }

  if (!profile.verified && profile.verificationStatus !== "verified") {
    return NextResponse.json(
      {
        message: "Only verified candidates can apply. Finish your profile and request verification first.",
        redirectTo: "/dashboard/profile",
      },
      { status: 403 },
    );
  }

  const persistedJob = await resolvePersistedJobId(identifier);

  if (!persistedJob.id || !persistedJob.job) {
    return NextResponse.json(
      { message: persistedJob.message ?? "We could not prepare this application." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("applications").insert({
    job_id: persistedJob.id,
    candidate_id: profile.id,
    resume_url: profile.resumeUrl || null,
    cover_letter: `Applied via verified candidate flow on ${new Date().toISOString()}.`,
  } as never);

  if (error) {
    const postgrestError = error as PostgrestError;

    if (postgrestError.code === "23505") {
      return NextResponse.json({
        ok: true,
        alreadyApplied: true,
        applyUrl: persistedJob.job.applicationUrl,
        message: "You already applied for this job. Opening the source link again is safe if needed.",
      });
    }

    return NextResponse.json(
      { message: "We could not submit your application right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    applyUrl: persistedJob.job.applicationUrl,
    message: "Application submitted. Continue on the source page if the employer needs extra steps.",
  });
}
