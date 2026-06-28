import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { resumeAiRequestSchema } from "@/lib/resume/schema";

function buildFallbackKeywords(role: string, jobDescription: string, skills: string[]) {
  const seed = `${role} ${jobDescription} ${skills.join(" ")}`.toLowerCase();
  const commonTerms = [
    "communication",
    "teamwork",
    "analysis",
    "reporting",
    "compliance",
    "customer service",
    "problem solving",
  ];

  return Array.from(
    new Set([
      role,
      ...skills.slice(0, 6),
      ...commonTerms.filter((term) => seed.includes(term.split(" ")[0])),
    ]),
  )
    .filter(Boolean)
    .slice(0, 12);
}

export async function POST(request: Request) {
  const rateLimit = checkAiRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const parsed = resumeAiRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid AI request." }, { status: 400 });
  }

  const payload = parsed.data;
  const result = await generateStructuredAiResponse("resumeGenerator", payload);

  if (result?.summary || result?.improved_bullets || result?.ats_keywords) {
    return NextResponse.json(result);
  }

  const fallbackKeywords = buildFallbackKeywords(
    payload.role,
    payload.jobDescription,
    payload.skills,
  );

  const fallbackSummary = `Results-driven ${payload.role} candidate with ${payload.experienceLevel} experience, strong communication, execution discipline, and practical skills aligned to the target role.`;
  const fallbackBullets =
    payload.bullets.length > 0
      ? payload.bullets.map(
          (bullet) =>
            `${bullet.replace(/\.$/, "")}, with emphasis on measurable outcomes, collaboration, and business impact.`,
        )
      : [
          `Delivered role-aligned work with focus on quality, timeliness, and clear stakeholder communication.`,
        ];

  return NextResponse.json({
    summary:
      payload.action === "improve-bullets"
        ? undefined
        : typeof result?.data?.summary === "string"
          ? result.data.summary
          : fallbackSummary,
    improved_bullets:
      payload.action === "generate-summary" ? undefined : fallbackBullets,
    ats_keywords: fallbackKeywords,
    note:
      "Fallback suggestions were generated locally because a structured AI response was unavailable.",
  });
}
