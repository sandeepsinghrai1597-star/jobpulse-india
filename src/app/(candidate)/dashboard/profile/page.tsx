import { CandidateProfileForm } from "@/components/candidate/candidate-profile-form";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { getEmptyCandidateProfile, mapCandidateProfileRow } from "@/lib/candidate/profile";
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

export default async function CandidateProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialProfile = getEmptyCandidateProfile();
  let hasResumeOnFile = false;

  if (user) {
    const [{ data }, resumesResult] = await Promise.all([
      supabase
        .from("candidate_profiles")
        .select(profileSelect)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("resumes")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", user.id),
    ]);

    initialProfile = mapCandidateProfileRow(data);
    hasResumeOnFile = (resumesResult.count ?? 0) > 0;
  }

  return (
    <DashboardShell
      role="candidate"
      title="Candidate profile"
      description="Build a verified profile with skills, preferences, resume, and application-ready identity details."
    >
      <CandidateProfileForm initialProfile={initialProfile} hasResumeOnFile={hasResumeOnFile} />
    </DashboardShell>
  );
}
