import { NextRequest, NextResponse } from "next/server";
import { rejectUnauthorizedCronRequest } from "@/lib/api/cron-auth";
import { syncOfficialSources } from "@/lib/jobs/live";

export async function GET(request: NextRequest) {
  const unauthorizedResponse = rejectUnauthorizedCronRequest(request);
  if (unauthorizedResponse) return unauthorizedResponse;

  const result = await syncOfficialSources();

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    strategy: "verified-source only",
    processed: result.jobs.length,
    note: result.note,
  });
}
