import { NextResponse } from "next/server";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { jobSearchSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = jobSearchSchema.safeParse({
    keyword: searchParams.get("keyword") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    jobType: searchParams.get("jobType") ?? undefined,
    workMode: searchParams.get("workMode") ?? undefined,
    education: searchParams.get("education") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const matchedJobs = await searchUnifiedJobs(parsed.data);
  return NextResponse.json({ jobs: matchedJobs, total: matchedJobs.length });
}
