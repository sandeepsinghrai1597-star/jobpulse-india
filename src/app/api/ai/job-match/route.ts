import { NextResponse } from "next/server";
import { getCachedOrComputeJobMatches } from "@/lib/candidate/job-match";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { mapCandidateProfileRow } from "@/lib/candidate/profile";
import { getUnifiedJobByIdentifier } from "@/lib/jobs/live";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const rateLimit = checkAiRateLimit(getClientIp(request), user?.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData } = await supabase
    .from("candidate_profiles")
    .select(
      "id, user_id, full_name, phone, headline, bio, education, skills, experience, city, state, preferred_roles, expected_salary, preferred_job_types, language_preference, resume_url, verified, verification_status, verification_requested_at, verified_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const profile = mapCandidateProfileRow(profileData);
  if (!profileData?.id) {
    return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
  }

  const jobIdentifier =
    typeof body?.jobId === "string"
      ? body.jobId
      : typeof body?.jobSlug === "string"
        ? body.jobSlug
        : null;

  if (!jobIdentifier) {
    return NextResponse.json({ error: "jobId or jobSlug is required" }, { status: 400 });
  }

  const job = await getUnifiedJobByIdentifier(jobIdentifier);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const result = (
    await getCachedOrComputeJobMatches({
      supabase,
      profile: {
        ...profile,
        id: profileData.id,
      },
      jobs: [job],
    })
  ).get(job.id);

  return NextResponse.json(result);
}
