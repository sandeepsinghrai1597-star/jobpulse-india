import { NextRequest, NextResponse } from "next/server";
import { syncExpiredJobs } from "@/server/jobs/expiration";

export const maxDuration = 30;

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized cron request." }, { status: 401 });
  }

  const result = await syncExpiredJobs({ force: true });

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    expiredJobs: result.expiredIds.length,
    jobIds: result.expiredIds,
  });
}
