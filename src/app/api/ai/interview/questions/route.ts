import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { interviewRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const rateLimit = checkAiRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await request.json();
  const parsed = interviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await generateStructuredAiResponse("interviewQuestionGenerator", parsed.data);
  return NextResponse.json(result);
}
