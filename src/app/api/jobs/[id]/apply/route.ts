import { NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { ensurePersistedJobByIdentifier } from "@/lib/jobs/persistence";
import { createClient } from "@/lib/supabase/server";

async function resolveCandidateProfileId(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: existingProfile, error: profileError } = await supabase
    .from("candidate_profiles")
    .select("id, resume_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      id: null,
      profileResumeUrl: null,
      message: "We could not load your candidate profile right now.",
    };
  }

  if (existingProfile?.id) {
    return {
      id: existingProfile.id as string,
      profileResumeUrl: existingProfile.resume_url ?? null,
      message: null,
    };
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("candidate_profiles")
    .insert({ user_id: userId } as never)
    .select("id, resume_url")
    .single();

  if (createError || !createdProfile?.id) {
    return {
      id: null,
      profileResumeUrl: null,
      message: "We could not prepare your candidate profile for this application.",
    };
  }

  return {
    id: createdProfile.id as string,
    profileResumeUrl: createdProfile.resume_url ?? null,
    message: null,
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to apply.", redirectTo: `/login?next=/jobs/${identifier}` },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const selectedResumeId = String(formData.get("resumeId") ?? "").trim();
  const uploadedResumeUrl = String(formData.get("uploadedResumeUrl") ?? "").trim();
  const coverLetter = String(formData.get("coverLetter") ?? "").trim();

  const candidateProfile = await resolveCandidateProfileId(user.id, supabase);
  if (!candidateProfile.id) {
    return NextResponse.json(
      { message: candidateProfile.message ?? "Could not prepare your profile." },
      { status: 500 },
    );
  }

  let resumeId: string | null = null;
  let resumeUrl: string | null = null;

  if (selectedResumeId) {
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id, file_url")
      .eq("id", selectedResumeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeError || !resume?.id) {
      return NextResponse.json({ message: "The selected resume was not found." }, { status: 400 });
    }

    resumeId = resume.id as string;
    resumeUrl = resume.file_url ?? null;
  } else if (uploadedResumeUrl) {
    resumeUrl = uploadedResumeUrl;
  } else if (candidateProfile.profileResumeUrl) {
    resumeUrl = candidateProfile.profileResumeUrl;
  }

  if (!resumeId && !resumeUrl) {
    return NextResponse.json(
      { message: "Select an uploaded resume or upload a new resume before applying." },
      { status: 400 },
    );
  }

  const persistedJob = await ensurePersistedJobByIdentifier(identifier);

  if (!persistedJob.id || !persistedJob.job) {
    return NextResponse.json(
      { message: persistedJob.message ?? "We could not prepare this application." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("applications").insert({
    job_id: persistedJob.id,
    candidate_id: candidateProfile.id,
    resume_id: resumeId,
    resume_url: resumeUrl,
    cover_letter: coverLetter || null,
  } as never);

  if (error) {
    const postgrestError = error as PostgrestError;

    if (postgrestError.code === "23505") {
      return NextResponse.json({
        ok: true,
        alreadyApplied: true,
        applied: true,
        message: "You already applied for this job.",
      });
    }

    return NextResponse.json(
      { message: "We could not submit your application right now." },
      { status: 500 },
    );
  }

  await recordAnalyticsEvent({
    userId: user.id,
    candidateId: candidateProfile.id,
    jobId: persistedJob.id,
    eventName: "job_application",
    eventData: {
      jobIdentifier: identifier,
      jobSlug: persistedJob.job.slug,
      sourceType: persistedJob.job.sourceType ?? null,
      city: persistedJob.job.city,
    },
  });

  return NextResponse.json({
    ok: true,
    applied: true,
    message: "Application submitted successfully.",
  });
}
