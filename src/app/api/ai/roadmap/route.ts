import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import {
  buildRoadmapGeneratorFallback,
  findCareerGuide,
  learningRoadmapCareers,
} from "@/lib/data/learning-roadmaps";
import type { RoadmapGeneratorResult } from "@/types";

function isRoadmapGeneratorResult(
  value: unknown,
): value is Omit<RoadmapGeneratorResult, "note"> & { note?: string } {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.targetCareer === "string" &&
    Array.isArray(candidate.skillsRequired) &&
    Array.isArray(candidate.weeklyPlan) &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.resumeKeywords) &&
    Array.isArray(candidate.interviewTopics)
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as { targetCareer?: string };
  const targetCareer = body.targetCareer?.trim();

  if (!targetCareer) {
    return NextResponse.json(
      { error: "Target career is required." },
      { status: 400 },
    );
  }

  const matchedGuide = findCareerGuide(targetCareer);
  const fallback = buildRoadmapGeneratorFallback(targetCareer);

  const result = await generateStructuredAiResponse("learningRoadmapGenerator", {
    targetCareer,
    supportedCareers: learningRoadmapCareers,
    roleContext: matchedGuide
      ? {
          summary: matchedGuide.summary,
          skills: matchedGuide.skills,
          roadmap30Days: matchedGuide.roadmap30Days,
          projects: matchedGuide.projects,
          jobsToApplyFor: matchedGuide.jobsToApplyFor,
        }
      : undefined,
  });

  if (isRoadmapGeneratorResult(result)) {
    return NextResponse.json({
      ...result,
      note:
        result.note ??
        (matchedGuide
          ? "AI roadmap generated with JobPulse guide context."
          : "AI roadmap generated for your target career."),
    });
  }

  return NextResponse.json({
    ...fallback,
    note:
      matchedGuide
        ? "Generated from the built-in JobPulse roadmap library."
        : `Generated using the closest built-in roadmap. Supported careers include ${learningRoadmapCareers.join(", ")}.`,
  });
}
