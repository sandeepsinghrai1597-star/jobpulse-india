import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  canRequestVerification,
  mapCandidateProfileRow,
} from "@/lib/candidate/profile";
import { candidateProfileSchema } from "@/lib/validation/schemas";

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

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("candidate_profiles")
    .select(profileSelect)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { message: "We could not load your candidate profile yet." },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: mapCandidateProfileRow(data) });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = candidateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Please fix the profile details and try again.",
      },
      { status: 400 },
    );
  }

  const { data: existingProfile } = await supabase
    .from("candidate_profiles")
    .select(profileSelect)
    .eq("user_id", user.id)
    .maybeSingle();
  const { count: resumeCount } = await supabase
    .from("resumes")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);

  const existing = mapCandidateProfileRow(existingProfile);
  const nextProfile = {
    ...existing,
    ...parsed.data,
  };

  const wantsVerification =
    parsed.data.requestVerification &&
    canRequestVerification(nextProfile, { hasResumeOnFile: (resumeCount ?? 0) > 0 });
  const existingStatus = existing.verificationStatus;

  const verificationStatus = existing.verified
    ? "verified"
    : wantsVerification
      ? "pending"
      : existingStatus === "pending" || existingStatus === "rejected"
        ? existingStatus
        : "draft";

  const payload = {
    user_id: user.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    headline: parsed.data.headline,
    bio: parsed.data.bio,
    education: parsed.data.education,
    skills: parsed.data.skills,
    experience: parsed.data.experience,
    city: parsed.data.city,
    state: parsed.data.state,
    preferred_roles: parsed.data.preferredRoles,
    expected_salary: parsed.data.expectedSalary,
    preferred_job_types: parsed.data.preferredJobTypes,
    language_preference: parsed.data.languagePreference,
    resume_url: parsed.data.resumeUrl,
    verified: existing.verified,
    verification_status: verificationStatus,
    verification_requested_at:
      wantsVerification && existingStatus !== "pending"
        ? new Date().toISOString()
        : existing.verificationRequestedAt,
  };

  const { data, error } = await supabase
    .from("candidate_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select(profileSelect)
    .single();

  if (error) {
    return NextResponse.json(
      { message: "We could not save your candidate profile right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    profile: mapCandidateProfileRow(data),
    message:
      verificationStatus === "pending"
        ? "Profile saved and verification requested. Our team can now review your profile."
        : "Candidate profile saved successfully.",
  });
}
