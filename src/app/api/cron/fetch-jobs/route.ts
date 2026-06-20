import { NextRequest, NextResponse } from "next/server";
import { runJobFetchScheduler } from "@/server/job-fetcher/scheduler";

export const maxDuration = 55;

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

  const results = await runJobFetchScheduler("cron");
  const summary = results.reduce(
    (accumulator, result) => ({
      processedSources: accumulator.processedSources + 1,
      successfulSources: accumulator.successfulSources + (result.ok && !result.skipped ? 1 : 0),
      skippedSources: accumulator.skippedSources + (result.skipped ? 1 : 0),
      failedSources: accumulator.failedSources + (!result.ok ? 1 : 0),
      totalFound: accumulator.totalFound + result.totalFound,
      totalNew: accumulator.totalNew + result.totalNew,
      totalDuplicates: accumulator.totalDuplicates + result.totalDuplicates,
      totalFailedItems: accumulator.totalFailedItems + result.totalFailed,
    }),
    {
      processedSources: 0,
      successfulSources: 0,
      skippedSources: 0,
      failedSources: 0,
      totalFound: 0,
      totalNew: 0,
      totalDuplicates: 0,
      totalFailedItems: 0,
    },
  );

  return NextResponse.json({
    ok: summary.failedSources === 0,
    fetchedAt: new Date().toISOString(),
    summary,
    results,
    note: "Fetched jobs were staged into pending_review and were not auto-published.",
  });
}
