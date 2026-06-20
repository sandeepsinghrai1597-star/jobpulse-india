import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import type { NormalizedJobDraft } from "@/server/job-fetcher/types";

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeAiJobType(value: string | null | undefined): NormalizedJobDraft["job_type"] | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("freelance")) return "freelance";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("walk")) return "walk-in";
  return "full-time";
}

function normalizeAiWorkMode(value: string | null | undefined): NormalizedJobDraft["work_mode"] | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (/\b(remote|wfh|work from home)\b/.test(normalized)) return "remote";
  if (/\bhybrid\b/.test(normalized)) return "hybrid";
  return "onsite";
}

function needsEnrichment(job: NormalizedJobDraft) {
  return (
    job.skills.length === 0 ||
    !job.industry ||
    !job.education_required ||
    !job.job_type ||
    !job.work_mode ||
    job.description.length < 80
  );
}

export async function enrichNormalizedJob(job: NormalizedJobDraft) {
  if (!needsEnrichment(job)) {
    return job;
  }

  const result = await generateStructuredAiResponse("jobMatcher", {
    instruction:
      "Infer only from the provided job content. Return JSON with cleaned_title, summary, suggested_skills, industry, education_required, job_type, work_mode, and confidence_note. Do not invent employer-specific facts.",
    job,
  });

  const aiPayload =
    result && typeof result === "object" && "ai" in result && result.ai && typeof result.ai === "object"
      ? (result.ai as Record<string, unknown>)
      : (result as Record<string, unknown> | null);

  if (!aiPayload) {
    return job;
  }

  const nextSkills =
    job.skills.length > 0
      ? job.skills
      : Array.from(new Set(toStringList(aiPayload.suggested_skills).slice(0, 12)));

  const nextDescription =
    job.description.length >= 80
      ? job.description
      : firstNonEmpty(typeof aiPayload.summary === "string" ? aiPayload.summary : undefined, job.description) ?? job.description;

  const nextTitle =
    firstNonEmpty(typeof aiPayload.cleaned_title === "string" ? aiPayload.cleaned_title : undefined, job.title) ?? job.title;

  const note = firstNonEmpty(typeof aiPayload.confidence_note === "string" ? aiPayload.confidence_note : undefined, null);

  return {
    ...job,
    title: nextTitle,
    description: nextDescription,
    skills: nextSkills,
    industry: firstNonEmpty(typeof aiPayload.industry === "string" ? aiPayload.industry : undefined, job.industry) ?? null,
    education_required:
      firstNonEmpty(
        typeof aiPayload.education_required === "string" ? aiPayload.education_required : undefined,
        job.education_required,
      ) ?? null,
    job_type: normalizeAiJobType(firstNonEmpty(typeof aiPayload.job_type === "string" ? aiPayload.job_type : undefined, job.job_type)),
    work_mode: normalizeAiWorkMode(firstNonEmpty(typeof aiPayload.work_mode === "string" ? aiPayload.work_mode : undefined, job.work_mode)),
    enrichment_notes: note ? [...(job.enrichment_notes ?? []), note] : job.enrichment_notes,
  };
}
