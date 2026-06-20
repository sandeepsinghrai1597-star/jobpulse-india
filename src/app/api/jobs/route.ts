import { NextResponse } from "next/server";
import { parsePublicJobsQuery, searchPublicJobs } from "@/lib/jobs/public-search";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string | string[] | undefined> = {};

  for (const key of url.searchParams.keys()) {
    const values = url.searchParams.getAll(key);
    params[key] = values.length > 1 ? values : values[0];
  }

  const query = parsePublicJobsQuery(params);
  const result = await searchPublicJobs(query);

  return NextResponse.json({
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
    results: result.results,
  });
}
