import type { CandidateProfile, CandidateVerificationStatus } from "@/types";

interface CandidateProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  headline: string | null;
  bio: string | null;
  education: string | null;
  skills: string[] | null;
  experience: string | null;
  city: string | null;
  state: string | null;
  preferred_roles: string[] | null;
  expected_salary: number | null;
  preferred_job_types: string[] | null;
  language_preference: string | null;
  resume_url: string | null;
  verified: boolean | null;
  verification_status: CandidateVerificationStatus | null;
  verification_requested_at: string | null;
  verified_at: string | null;
  updated_at: string | null;
}

export function getEmptyCandidateProfile(): CandidateProfile {
  return {
    fullName: "",
    phone: "",
    headline: "",
    bio: "",
    education: "",
    skills: [],
    experience: "",
    city: "",
    state: "",
    preferredRoles: [],
    expectedSalary: null,
    preferredJobTypes: ["full-time"],
    languagePreference: "English",
    resumeUrl: "",
    verified: false,
    verificationStatus: "draft",
    verificationRequestedAt: null,
    verifiedAt: null,
    updatedAt: null,
  };
}

export function mapCandidateProfileRow(row: CandidateProfileRow | null): CandidateProfile {
  if (!row) {
    return getEmptyCandidateProfile();
  }

  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    education: row.education ?? "",
    skills: row.skills ?? [],
    experience: row.experience ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    preferredRoles: row.preferred_roles ?? [],
    expectedSalary: row.expected_salary,
    preferredJobTypes: row.preferred_job_types ?? ["full-time"],
    languagePreference: row.language_preference ?? "English",
    resumeUrl: row.resume_url ?? "",
    verified: row.verified ?? false,
    verificationStatus: row.verification_status ?? "draft",
    verificationRequestedAt: row.verification_requested_at,
    verifiedAt: row.verified_at,
    updatedAt: row.updated_at,
  };
}

export function parseListInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function canRequestVerification(profile: CandidateProfile) {
  return Boolean(
    profile.fullName &&
      profile.phone &&
      profile.education &&
      profile.city &&
      profile.state &&
      profile.experience &&
      profile.resumeUrl &&
      profile.skills.length > 0 &&
      profile.preferredRoles.length > 0,
  );
}

export function calculateProfileCompletion(profile: CandidateProfile) {
  const checks = [
    profile.fullName,
    profile.phone,
    profile.headline,
    profile.bio,
    profile.education,
    profile.experience,
    profile.city,
    profile.state,
    profile.resumeUrl,
    profile.skills.length > 0 ? "skills" : "",
    profile.preferredRoles.length > 0 ? "roles" : "",
    profile.preferredJobTypes.length > 0 ? "jobTypes" : "",
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function isCandidateVerified(profile: CandidateProfile | null) {
  return Boolean(profile && (profile.verified || profile.verificationStatus === "verified"));
}
