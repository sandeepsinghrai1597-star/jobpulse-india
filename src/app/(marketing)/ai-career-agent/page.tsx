import { CareerAgentChat } from "@/components/ai/career-agent-chat";
import { mapCandidateProfileRow } from "@/lib/candidate/profile";
import { buildMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { CareerAgentContext } from "@/lib/ai/career-agent";

export const metadata = buildMetadata({
  title: "AI Career Agent",
  description:
    "Chat with an AI career agent for role guidance, verified job matches, skill gaps, resume improvement, interview prep, salary guidance, and action plans.",
  path: "/ai-career-agent",
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

async function getInitialCareerContext(): Promise<Partial<CareerAgentContext>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return {};

    const { data } = await supabase
      .from("candidate_profiles")
      .select(profileSelect)
      .eq("user_id", user.id)
      .maybeSingle();

    const profile = mapCandidateProfileRow(data);

    return {
      education: profile.education,
      skills: profile.skills,
      city: profile.city,
      experience: profile.experience,
      preferredRole: profile.preferredRoles[0] ?? "",
      salaryExpectation: profile.expectedSalary ? String(profile.expectedSalary) : "",
    };
  } catch {
    return {};
  }
}

export default async function AiCareerAgentPage() {
  const initialContext = await getInitialCareerContext();

  return <CareerAgentChat initialContext={initialContext} />;
}
