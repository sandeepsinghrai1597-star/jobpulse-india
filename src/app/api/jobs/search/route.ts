import { NextResponse } from "next/server";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { jobSearchSchema } from "@/lib/validation/schemas";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const offset = (page - 1) * limit;
  const jobs = matchedJobs.slice(offset, offset + limit);
  const total = matchedJobs.length;

  return NextResponse.json({
    jobs,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
