import type { Job, SalaryType } from "@/types";

export const SALARY_DISCLAIMER =
  "Salary estimates are approximate and may vary by company, city, skills, and market condition.";

export interface SalaryCalculatorInput {
  jobRole: string;
  city: string;
  experience: string;
  skills: string[];
  education: string;
}

export interface SalaryDataRow {
  id?: string;
  job_title: string;
  city: string | null;
  state: string | null;
  experience_range: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: SalaryType;
  source: string | null;
}

export interface SalaryCalculatorResult {
  source: "salary_data" | "ai_estimate";
  sourceLabel: string;
  estimateNote?: string;
  expectedSalaryRange: string;
  entryLevelSalary: string;
  averageSalary: string;
  highSalary: string;
  skillsThatIncreaseSalary: string[];
  similarRoles: string[];
  suggestedJobs: Job[];
  disclaimer: string;
  matchedSalaryRecords: number;
}

interface AiSalaryEstimate {
  entry_level?: string;
  average?: string;
  high?: string;
  drivers?: unknown;
  related_roles?: unknown;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function parseYears(experience: string) {
  const match = experience.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function roundToNearestThousand(value: number) {
  return Math.round(value / 1000) * 1000;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(roundToNearestThousand(value));
}

function formatSalaryValue(value: number, salaryType: SalaryType) {
  const unit = salaryType === "monthly" ? "month" : salaryType === "stipend" ? "stipend" : "year";
  return `${formatCurrency(value)} / ${unit}`;
}

function formatRange(min: number, max: number, salaryType: SalaryType) {
  const unit = salaryType === "monthly" ? "month" : salaryType === "stipend" ? "stipend" : "year";
  return `${formatCurrency(min)} - ${formatCurrency(max)} / ${unit}`;
}

function scoreExperienceRange(range: string | null, years: number | null) {
  if (!range || years === null) return 0;

  const lowered = normalize(range);
  if (/\b(fresher|entry|graduate)\b/.test(lowered)) {
    return years <= 1 ? 3 : 0;
  }

  const between = lowered.match(/(\d+(?:\.\d+)?)\s*[-to]+\s*(\d+(?:\.\d+)?)/);
  if (between) {
    const min = Number(between[1]);
    const max = Number(between[2]);
    if (years >= min && years <= max) return 4;
    if (years >= min - 1 && years <= max + 1) return 2;
    return 0;
  }

  const plus = lowered.match(/(\d+(?:\.\d+)?)\s*\+/);
  if (plus) {
    const min = Number(plus[1]);
    return years >= min ? 3 : 0;
  }

  return 0;
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function getRoleKeywordPattern(jobRole: string) {
  const tokens = jobRole
    .split(/[\s/,-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .map(escapeRegExp);

  if (tokens.length === 0) return null;
  return new RegExp(tokens.join("|"), "i");
}

function scoreJob(job: Job, input: SalaryCalculatorInput) {
  const role = normalize(input.jobRole);
  const city = normalize(input.city);
  const jobText = `${job.title} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
  const skillSet = new Set(input.skills.map(normalize));
  const overlap = job.skills.filter((skill) => skillSet.has(normalize(skill))).length;

  let score = 0;
  if (normalize(job.title).includes(role)) score += 8;
  else if (jobText.includes(role)) score += 4;

  if (city && normalize(job.city).includes(city)) score += 3;
  score += overlap * 2;

  if (input.education && normalize(job.educationRequired).includes(normalize(input.education))) {
    score += 1;
  }

  return score;
}

function getSuggestedJobs(jobs: Job[], input: SalaryCalculatorInput) {
  return jobs
    .filter((job) => job.status === "active")
    .map((job) => ({ job, score: scoreJob(job, input) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return (right.job.salaryMax ?? 0) - (left.job.salaryMax ?? 0);
    })
    .slice(0, 3)
    .map((entry) => entry.job);
}

function getSimilarRoles(jobs: Job[], rows: SalaryDataRow[], input: SalaryCalculatorInput) {
  const role = normalize(input.jobRole);
  const pattern = getRoleKeywordPattern(input.jobRole);

  const fromJobs = jobs
    .filter((job) => {
      if (normalize(job.title) === role) return false;
      return pattern ? pattern.test(job.title) : false;
    })
    .map((job) => job.title);

  const fromRows = rows
    .filter((row) => normalize(row.job_title) !== role)
    .map((row) => row.job_title);

  return dedupe([...fromRows, ...fromJobs]).slice(0, 6);
}

function getSkillsThatIncreaseSalary(jobs: Job[], input: SalaryCalculatorInput) {
  const inputSkills = new Set(input.skills.map(normalize));
  const relevant = jobs
    .filter((job) => scoreJob(job, input) > 0 && job.salaryMax > 0)
    .sort(
      (left, right) =>
        ((right.salaryMin + right.salaryMax) / 2) - ((left.salaryMin + left.salaryMax) / 2),
    )
    .slice(0, 12);

  const weightedScores = new Map<string, number>();

  for (const job of relevant) {
    const midpoint = (job.salaryMin + job.salaryMax) / 2;
    const weight = Math.max(1, midpoint / 100000);

    for (const skill of job.skills) {
      const normalizedSkill = normalize(skill);
      if (!normalizedSkill || inputSkills.has(normalizedSkill)) continue;
      weightedScores.set(skill, (weightedScores.get(skill) ?? 0) + weight);
    }
  }

  return [...weightedScores.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([skill]) => skill);
}

export function normalizeSalaryCalculatorInput(payload: Record<string, unknown>): SalaryCalculatorInput {
  const experienceValue =
    typeof payload.experience === "number"
      ? String(payload.experience)
      : typeof payload.experience === "string"
        ? payload.experience
        : "";

  const skillsValue = Array.isArray(payload.skills)
    ? payload.skills
    : typeof payload.skills === "string"
      ? payload.skills.split(",")
      : [];

  return {
    jobRole: typeof payload.jobRole === "string" ? payload.jobRole.trim() : "",
    city: typeof payload.city === "string" ? payload.city.trim() : "",
    experience: experienceValue.trim(),
    skills: dedupe(
      skillsValue
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
    education: typeof payload.education === "string" ? payload.education.trim() : "",
  };
}

export function buildSalaryCalculatorResult(args: {
  input: SalaryCalculatorInput;
  rows: SalaryDataRow[];
  jobs: Job[];
  aiEstimate?: AiSalaryEstimate | null;
}): SalaryCalculatorResult {
  const { input, rows, jobs, aiEstimate } = args;
  const suggestedJobs = getSuggestedJobs(jobs, input);
  const similarRoles = getSimilarRoles(suggestedJobs.length > 0 ? suggestedJobs : jobs, rows, input);
  const skillsThatIncreaseSalary = getSkillsThatIncreaseSalary(
    suggestedJobs.length > 0 ? suggestedJobs : jobs,
    input,
  );

  const validRows = rows.filter(
    (row): row is SalaryDataRow & { salary_min: number; salary_max: number } =>
      typeof row.salary_min === "number" && typeof row.salary_max === "number",
  );

  if (validRows.length > 0) {
    const years = parseYears(input.experience);
    const scoredRows = validRows
      .map((row) => ({
        row,
        score: scoreExperienceRange(row.experience_range, years),
      }))
      .sort((left, right) => right.score - left.score);

    const matchedRows =
      scoredRows.length > 0 && scoredRows[0].score > 0
        ? scoredRows.filter((entry) => entry.score === scoredRows[0].score).map((entry) => entry.row)
        : validRows;

    const minSalary = Math.min(...matchedRows.map((row) => row.salary_min));
    const maxSalary = Math.max(...matchedRows.map((row) => row.salary_max));
    const averageMidpoint =
      matchedRows.reduce((sum, row) => sum + (row.salary_min + row.salary_max) / 2, 0) /
      matchedRows.length;

    const entryRows = validRows.filter((row) =>
      /\b(fresher|entry|graduate|0\s*[-to]\s*1|0\s*[-to]\s*2)\b/i.test(
        row.experience_range ?? "",
      ),
    );

    const entryValue =
      entryRows.length > 0
        ? entryRows.reduce((sum, row) => sum + row.salary_min, 0) / entryRows.length
        : minSalary;
    const highValue = maxSalary;
    const salaryType = matchedRows[0]?.salary_type ?? "yearly";

    return {
      source: "salary_data",
      sourceLabel: "Matched from salary_data",
      estimateNote:
        matchedRows.length < validRows.length
          ? "Experience-adjusted using the closest salary_data records available."
          : "Built from salary_data records matching this role and city.",
      expectedSalaryRange: formatRange(minSalary, maxSalary, salaryType),
      entryLevelSalary: formatSalaryValue(entryValue, salaryType),
      averageSalary: formatSalaryValue(averageMidpoint, salaryType),
      highSalary: formatSalaryValue(highValue, salaryType),
      skillsThatIncreaseSalary:
        skillsThatIncreaseSalary.length > 0
          ? skillsThatIncreaseSalary
          : ["SQL", "Excel", "Communication", "Automation"],
      similarRoles,
      suggestedJobs,
      disclaimer: SALARY_DISCLAIMER,
      matchedSalaryRecords: validRows.length,
    };
  }

  const aiDrivers = toStringArray(aiEstimate?.drivers);
  const aiRoles = toStringArray(aiEstimate?.related_roles);
  const aiEntry = aiEstimate?.entry_level?.trim() || "Approx. INR 3,00,000 / year";
  const aiAverage = aiEstimate?.average?.trim() || "Approx. INR 5,00,000 / year";
  const aiHigh = aiEstimate?.high?.trim() || "Approx. INR 8,00,000 / year";

  return {
    source: "ai_estimate",
    sourceLabel: "AI estimate",
    estimateNote:
      "No matching salary_data rows were found for this combination, so this estimate uses AI-guided market heuristics.",
    expectedSalaryRange: `${aiEntry} to ${aiHigh}`,
    entryLevelSalary: aiEntry,
    averageSalary: aiAverage,
    highSalary: aiHigh,
    skillsThatIncreaseSalary:
      aiDrivers.length > 0 ? aiDrivers.slice(0, 6) : skillsThatIncreaseSalary.slice(0, 6),
    similarRoles: aiRoles.length > 0 ? aiRoles.slice(0, 6) : similarRoles,
    suggestedJobs,
    disclaimer: SALARY_DISCLAIMER,
    matchedSalaryRecords: 0,
  };
}
