import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await generateStructuredAiResponse("resumeGenerator", body);
  return NextResponse.json(result);
}
