import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";

const skillGapRequestSchema = z.object({
  targetRole: z.string().trim().min(2, "Add the target role you want to prepare for."),
  currentSkills: z
    .union([
      z.array(z.string().trim().min(1)).min(1),
      z.string().trim().min(2),
    ])
    .transform((value) =>
      Array.isArray(value)
        ? value
        : value.split(",").map((skill) => skill.trim()).filter(Boolean),
    )
    .refine((value) => value.length > 0, "Add at least one current skill."),
  experienceLevel: z.string().trim().min(1).optional(),
  jobDescription: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const rateLimit = checkAiRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send a valid JSON request body." }, { status: 400 });
  }

  const parsed = skillGapRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "The skill-gap request is invalid.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await generateStructuredAiResponse("skillGapAnalyzer", parsed.data);
  return NextResponse.json(result);
}
