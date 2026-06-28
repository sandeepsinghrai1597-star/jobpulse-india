import { NextRequest, NextResponse } from "next/server";
import { syncExpiredJobs } from "@/server/jobs/expiration";
import { rejectUnauthorizedCronRequest } from "@/lib/api/cron-auth";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const unauthorizedResponse = rejectUnauthorizedCronRequest(request);
  if (unauthorizedResponse) return unauthorizedResponse;

  const result = await syncExpiredJobs({ force: true });

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    expiredJobs: result.expiredIds.length,
  });
}
