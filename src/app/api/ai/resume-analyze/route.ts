import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import {
  buildFallbackResumeAnalysis,
  extractResumeText,
  resumeAnalyzerUploadSchema,
  type ResumeAnalysisResult,
} from "@/lib/resume/analyzer";
import { createClient } from "@/lib/supabase/server";

function normalizeAnalysisPayload(
  value: Record<string, unknown> | null | undefined,
  fallback: ResumeAnalysisResult,
) {
  if (!value) {
    return fallback;
  }

  return {
    overall_score:
      typeof value.overall_score === "number" ? Math.round(value.overall_score) : fallback.overall_score,
    ats_score: typeof value.ats_score === "number" ? Math.round(value.ats_score) : fallback.ats_score,
    keyword_score:
      typeof value.keyword_score === "number"
        ? Math.round(value.keyword_score)
        : fallback.keyword_score,
    grammar_score:
      typeof value.grammar_score === "number"
        ? Math.round(value.grammar_score)
        : fallback.grammar_score,
    formatting_score:
      typeof value.formatting_score === "number"
        ? Math.round(value.formatting_score)
        : fallback.formatting_score,
    role_match_percentage:
      typeof value.role_match_percentage === "number"
        ? Math.round(value.role_match_percentage)
        : fallback.role_match_percentage,
    strengths: Array.isArray(value.strengths)
      ? value.strengths.filter((item): item is string => typeof item === "string")
      : fallback.strengths,
    weaknesses: Array.isArray(value.weaknesses)
      ? value.weaknesses.filter((item): item is string => typeof item === "string")
      : fallback.weaknesses,
    missing_skills: Array.isArray(value.missing_skills)
      ? value.missing_skills.filter((item): item is string => typeof item === "string")
      : fallback.missing_skills,
    missing_keywords: Array.isArray(value.missing_keywords)
      ? value.missing_keywords.filter((item): item is string => typeof item === "string")
      : fallback.missing_keywords,
    suggested_skills: Array.isArray(value.suggested_skills)
      ? value.suggested_skills.filter((item): item is string => typeof item === "string")
      : fallback.suggested_skills,
    suggested_improvements: Array.isArray(value.suggested_improvements)
      ? value.suggested_improvements.filter((item): item is string => typeof item === "string")
      : fallback.suggested_improvements,
    improved_summary:
      typeof value.improved_summary === "string"
        ? value.improved_summary
        : fallback.improved_summary,
    improved_bullets: Array.isArray(value.improved_bullets)
      ? value.improved_bullets.filter((item): item is string => typeof item === "string")
      : fallback.improved_bullets,
    extracted_text: fallback.extracted_text,
    analyzed_role:
      typeof value.analyzed_role === "string" && value.analyzed_role.trim().length > 0
        ? value.analyzed_role
        : fallback.analyzed_role,
    note: typeof value.note === "string" ? value.note : fallback.note,
  } satisfies ResumeAnalysisResult;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Upload a resume file first." }, { status: 400 });
  }

  const parsed = resumeAnalyzerUploadSchema.safeParse({
    targetRole: formData.get("targetRole"),
    jobDescription: formData.get("jobDescription"),
    resumeId: formData.get("resumeId"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "The analysis request is invalid.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const extractedText = await extractResumeText(file);

    if (extractedText.length < 60) {
      return NextResponse.json(
        { message: "We could not extract enough text from this file. Try a cleaner PDF or DOCX." },
        { status: 400 },
      );
    }

    const payload = {
      resumeText: extractedText.slice(0, 16000),
      targetRole: parsed.data.targetRole || "Target role",
      jobDescription: parsed.data.jobDescription,
    };

    const fallback = buildFallbackResumeAnalysis(payload);
    const aiResult = await generateStructuredAiResponse("resumeAnalyzer", payload);
    const analysis = normalizeAnalysisPayload(
      aiResult && typeof aiResult === "object" ? (aiResult as Record<string, unknown>) : null,
      fallback,
    );

    let savedAnalysisId: string | null = null;
    let signedInUserId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        signedInUserId = user.id;
        const { data } = await supabase
          .from("resume_analyses")
          .insert({
            user_id: user.id,
            resume_id: parsed.data.resumeId ?? null,
            score: analysis.overall_score,
            match_score: analysis.role_match_percentage,
            job_description_text: parsed.data.jobDescription || null,
            missing_keywords: analysis.missing_keywords,
            suggestions: {
              strengths: analysis.strengths,
              weaknesses: analysis.weaknesses,
              ats_score: analysis.ats_score,
              keyword_score: analysis.keyword_score,
              grammar_score: analysis.grammar_score,
              formatting_score: analysis.formatting_score,
              missing_skills: analysis.missing_skills,
              suggested_skills: analysis.suggested_skills,
              suggested_improvements: analysis.suggested_improvements,
              improved_summary: analysis.improved_summary,
              improved_bullets: analysis.improved_bullets,
              analyzed_role: analysis.analyzed_role,
              file_name: file.name,
            },
          })
          .select("id")
          .single();

        savedAnalysisId = data?.id ?? null;
      }
    } catch {
      savedAnalysisId = null;
    }

    await recordAnalyticsEvent({
      userId: signedInUserId,
      eventName: "resume_analysis",
      eventData: {
        analysisId: savedAnalysisId,
        fileName: file.name,
        targetRole: parsed.data.targetRole || "Target role",
        score: analysis.overall_score,
        roleMatchPercentage: analysis.role_match_percentage,
      },
    });

    return NextResponse.json({
      analysis,
      savedAnalysisId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not analyze the uploaded resume.",
      },
      { status: 400 },
    );
  }
}
