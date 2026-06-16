import Link from "next/link";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { JobCard } from "@/components/jobs/job-card";
import { getDiscoveredJobsForCandidate } from "@/lib/candidate/matching";
import {
  calculateProfileCompletion,
  getEmptyCandidateProfile,
  mapCandidateProfileRow,
} from "@/lib/candidate/profile";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Candidate Dashboard",
  description: "Track resumes, applications, saved jobs, interviews, and AI recommendations.",
  path: "/dashboard",
});

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

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = getEmptyCandidateProfile();

  if (user) {
    const { data } = await supabase
      .from("candidate_profiles")
      .select(profileSelect)
      .eq("user_id", user.id)
      .maybeSingle();

    profile = mapCandidateProfileRow(data);
  }

  const discoveredJobs = getDiscoveredJobsForCandidate(profile, await searchUnifiedJobs({}));
  const completion = calculateProfileCompletion(profile);

  return (
    <DashboardShell
      role="candidate"
      title="Candidate dashboard"
      description="Track verification, profile strength, and matched jobs discovered from your candidate preferences."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-semibold">Profile snapshot</h2>
              <Badge className="rounded-full">{completion}% complete</Badge>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              <li>City: {profile.city || "Add your city"}</li>
              <li>Education: {profile.education || "Add your education"}</li>
              <li>Skills: {profile.skills.join(", ") || "Add skills"}</li>
              <li>Preferred roles: {profile.preferredRoles.join(", ") || "Add preferred roles"}</li>
              <li>
                Verification:{" "}
                {profile.verified || profile.verificationStatus === "verified"
                  ? "Verified"
                  : profile.verificationStatus === "pending"
                    ? "Pending review"
                    : "Not verified"}
              </li>
            </ul>
            <Link href="/dashboard/profile" className="text-sm font-semibold text-primary">
              Update profile and verification
            </Link>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-semibold">Job discovery</h2>
            <Link href="/jobs" className="text-sm font-semibold text-primary">
              Browse all jobs
            </Link>
          </div>
          {discoveredJobs.length > 0 ? (
            discoveredJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
              <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
                Add your city, skills, and preferred roles in the profile to unlock sharper job
                discovery recommendations.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
