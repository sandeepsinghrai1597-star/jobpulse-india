import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { resumeAnalysisSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = resumeAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await generateStructuredAiResponse("resumeAnalyzer", parsed.data);
  return NextResponse.json(result);
}
