import { computeJobMatchSummary } from "@/lib/candidate/job-match";
import type { CandidateProfile, Job } from "@/types";

const candidate: CandidateProfile & { id: string } = {
  id: "candidate-1",
  userId: "user-1",
  fullName: "Amrit",
  phone: "",
  headline: "",
  bio: "",
  education: "B.Tech in Computer Science",
  skills: ["React", "TypeScript", "SQL", "Node.js"],
  experience: "3 years in frontend development",
  city: "Bengaluru",
  state: "Karnataka",
  preferredRoles: [],
  expectedSalary: 900000,
  preferredJobTypes: ["full-time"],
  languagePreference: "English",
  resumeUrl: "",
  verified: false,
  verificationStatus: "draft",
  updatedAt: "2026-06-19T10:00:00.000Z",
};

const baseJob: Job = {
  id: "job-1",
  slug: "frontend-engineer",
  title: "Frontend Engineer",
  categorySlug: "it-jobs",
  companyName: "Acme",
  companyLogo: "AC",
  description: "Frontend role",
  responsibilities: [],
  requirements: [],
  skills: ["React", "TypeScript", "GraphQL"],
  salaryMin: 700000,
  salaryMax: 1000000,
  salaryType: "yearly",
  location: "Bengaluru, Karnataka",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  workMode: "onsite",
  experienceRequired: "2 to 4 years",
  experienceMin: 2,
  experienceMax: 4,
  educationRequired: "Bachelor's degree",
  jobType: "full-time",
  industry: "Technology",
  openings: 1,
  applicationDeadline: "2026-07-01",
  recruiterContact: "",
  applicationUrl: "",
  createdAt: "2026-06-19T10:00:00.000Z",
  updatedAt: "2026-06-19T10:00:00.000Z",
  status: "active",
};

describe("computeJobMatchSummary", () => {
  it("returns a strong recommendation for a close fit", () => {
    const result = computeJobMatchSummary(candidate, baseJob);

    expect(result.matchScore).toBeGreaterThanOrEqual(80);
    expect(result.matchingSkills).toEqual(["React", "TypeScript"]);
    expect(result.missingSkills).toEqual(["GraphQL"]);
    expect(result.recommendation).toBe("Highly recommended");
  });

  it("drops the score when salary and experience do not align", () => {
    const result = computeJobMatchSummary(candidate, {
      ...baseJob,
      id: "job-2",
      salaryMin: 300000,
      salaryMax: 500000,
      experienceMin: 6,
      experienceMax: 8,
      experienceRequired: "6 to 8 years",
      city: "Mumbai",
      location: "Mumbai, Maharashtra",
    });

    expect(result.matchScore).toBeLessThan(50);
    expect(result.recommendation).toBe("Upskill before applying");
  });
});
