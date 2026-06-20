import { z } from "zod";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";

export const careerAgentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(5000),
});

export const careerAgentContextSchema = z.object({
  education: z.string().trim().optional().default(""),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  city: z.string().trim().optional().default(""),
  experience: z.string().trim().optional().default(""),
  preferredRole: z.string().trim().optional().default(""),
  salaryExpectation: z.string().trim().optional().default(""),
  resumeText: z.string().trim().max(12000).optional().default(""),
  notes: z.string().trim().max(4000).optional().default(""),
});

export const careerAgentRequestSchema = z.object({
  messages: z.array(careerAgentMessageSchema).max(20).optional().default([]),
  context: careerAgentContextSchema,
});

export type CareerAgentContext = z.infer<typeof careerAgentContextSchema>;
export type CareerAgentMessage = z.infer<typeof careerAgentMessageSchema>;

export type CareerAgentJob = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  description: string;
  skills: string[];
  city: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

export type CareerAgentNeedsContextResponse = {
  type: "needs_context";
  missing_context: string[];
  message: string;
};

export type CareerAgentResultResponse = {
  type: "career_agent_result";
  summary: string;
  best_roles: string[];
  matching_jobs: Array<{
    id: string;
    slug: string;
    title: string;
    company_name: string;
    city: string | null;
    salary_min: number | null;
    salary_max: number | null;
    match_reason: string;
  }>;
  missing_skills: string[];
  salary_expectation: string;
  learning_roadmap: string[];
  next_7_days_action_plan: string[];
  disclaimer: string;
};

export type CareerAgentResponse =
  | CareerAgentNeedsContextResponse
  | CareerAgentResultResponse;

const requiredContextLabels: Array<{
  key: keyof Pick<
    CareerAgentContext,
    "education" | "skills" | "city" | "experience" | "preferredRole" | "salaryExpectation"
  >;
  label: string;
}> = [
  { key: "education", label: "education" },
  { key: "skills", label: "skills" },
  { key: "city", label: "city" },
  { key: "experience", label: "experience" },
  { key: "preferredRole", label: "preferred role" },
  { key: "salaryExpectation", label: "salary expectation" },
];

const disclaimer =
  "This guidance is informational and does not guarantee job placement, interviews, salary, or selection.";

function isPresent(value: CareerAgentContext[keyof CareerAgentContext]) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

export function getMissingCareerContext(context: CareerAgentContext) {
  return requiredContextLabels
    .filter((field) => !isPresent(context[field.key]))
    .map((field) => field.label);
}

export function buildNeedsContextResponse(
  missingContext: string[],
): CareerAgentNeedsContextResponse {
  return {
    type: "needs_context",
    missing_context: missingContext,
    message: `Please share your ${missingContext.join(", ")} so I can give accurate career guidance, job matches, skill gaps, salary guidance, and a focused action plan.`,
  };
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 12);
}

function getAiMatchingJobInputs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, matchReason: "" };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const id =
        typeof record.id === "string"
          ? record.id
          : typeof record.job_id === "string"
            ? record.job_id
            : "";

      const matchReason =
        typeof record.match_reason === "string"
          ? record.match_reason
          : typeof record.reason === "string"
            ? record.reason
            : "";

      return id ? { id, matchReason } : null;
    })
    .filter(Boolean) as Array<{ id: string; matchReason: string }>;
}

export function sanitizeMatchingJobs(
  aiMatchingJobs: unknown,
  availableJobs: CareerAgentJob[],
) {
  const jobsById = new Map(availableJobs.map((job) => [job.id, job]));

  return getAiMatchingJobInputs(aiMatchingJobs)
    .map(({ id, matchReason }) => {
      const job = jobsById.get(id);
      if (!job) return null;

      return {
        id: job.id,
        slug: job.slug,
        title: job.title,
        company_name: job.company_name,
        city: job.city,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        match_reason:
          matchReason ||
          "This opening overlaps with your stated role, skills, location, or experience context.",
      };
    })
    .filter(Boolean)
    .slice(0, 5) as CareerAgentResultResponse["matching_jobs"];
}

export function rankCareerAgentJobs(
  context: CareerAgentContext,
  jobs: CareerAgentJob[],
) {
  const role = context.preferredRole.toLowerCase();
  const city = context.city.toLowerCase();
  const skills = context.skills.map((skill) => skill.toLowerCase());

  return jobs
    .map((job) => {
      const haystack = [
        job.title,
        job.description,
        job.company_name,
        job.city ?? "",
        job.skills.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (role && haystack.includes(role)) score += 5;
      if (city && (job.city ?? "").toLowerCase().includes(city)) score += 3;
      score += job.skills.filter((skill) => skills.includes(skill.toLowerCase())).length * 2;

      return { job, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.job)
    .slice(0, 12);
}

function buildFallbackResult(
  context: CareerAgentContext,
  availableJobs: CareerAgentJob[],
): CareerAgentResultResponse {
  const fallbackJobs = availableJobs.slice(0, 3).map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    company_name: job.company_name,
    city: job.city,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    match_reason: "This database opening is one of the closest available matches for your profile context.",
  }));

  return {
    type: "career_agent_result",
    summary: `You are targeting ${context.preferredRole} roles in ${context.city}. Focus on proving role-ready skills, tightening your resume, and applying only to verified openings that match your profile.`,
    best_roles: [context.preferredRole, `Junior ${context.preferredRole}`, `${context.preferredRole} Trainee`],
    matching_jobs: fallbackJobs,
    missing_skills: [
      "Role-specific portfolio project",
      "Interview-ready examples",
      "Resume keywords from target job descriptions",
    ],
    salary_expectation: `Use ${context.salaryExpectation} as a discussion target, then compare it against role, city, experience, and company size before applying.`,
    learning_roadmap: [
      "Week 1: Refresh core concepts and update your resume for the target role.",
      "Week 2: Build or polish one practical project aligned with the role.",
      "Week 3: Practice interview questions and improve weak skill areas.",
      "Week 4: Apply consistently, track responses, and refine based on feedback.",
    ],
    next_7_days_action_plan: [
      "Day 1: Finalize target role and resume headline.",
      "Day 2: Add missing role keywords to your resume honestly.",
      "Day 3: Shortlist verified jobs and save the best matches.",
      "Day 4: Practice five common interview questions.",
      "Day 5: Improve one high-priority skill gap.",
      "Day 6: Apply to selected jobs with tailored notes.",
      "Day 7: Review progress and plan next week's applications.",
    ],
    disclaimer,
  };
}

export async function buildCareerAgentResponse({
  context,
  messages,
  jobs,
  generate = generateStructuredAiResponse,
}: {
  context: CareerAgentContext;
  messages: CareerAgentMessage[];
  jobs: CareerAgentJob[];
  generate?: typeof generateStructuredAiResponse;
}): Promise<CareerAgentResponse> {
  const missingContext = getMissingCareerContext(context);
  if (missingContext.length > 0) {
    return buildNeedsContextResponse(missingContext);
  }

  const rankedJobs = rankCareerAgentJobs(context, jobs);
  const availableJobs = rankedJobs.length > 0 ? rankedJobs : jobs.slice(0, 12);
  const aiResult = (await generate("careerAdvisor", {
    context,
    recent_messages: messages.slice(-8),
    available_jobs: availableJobs.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company_name: job.company_name,
      city: job.city,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      skills: job.skills,
      description: job.description.slice(0, 600),
    })),
    required_response_type: "career_agent_result",
  })) as Record<string, unknown>;

  const fallback = buildFallbackResult(context, availableJobs);
  const matchingJobs = sanitizeMatchingJobs(aiResult.matching_jobs, availableJobs);

  return {
    type: "career_agent_result",
    summary: typeof aiResult.summary === "string" ? aiResult.summary : fallback.summary,
    best_roles: toStringArray(aiResult.best_roles).length
      ? toStringArray(aiResult.best_roles)
      : fallback.best_roles,
    matching_jobs: matchingJobs,
    missing_skills: toStringArray(aiResult.missing_skills).length
      ? toStringArray(aiResult.missing_skills)
      : fallback.missing_skills,
    salary_expectation:
      typeof aiResult.salary_expectation === "string"
        ? aiResult.salary_expectation
        : fallback.salary_expectation,
    learning_roadmap: toStringArray(aiResult.learning_roadmap).length
      ? toStringArray(aiResult.learning_roadmap)
      : fallback.learning_roadmap,
    next_7_days_action_plan: toStringArray(aiResult.next_7_days_action_plan).length
      ? toStringArray(aiResult.next_7_days_action_plan)
      : fallback.next_7_days_action_plan,
    disclaimer: typeof aiResult.disclaimer === "string" ? aiResult.disclaimer : disclaimer,
  };
}
