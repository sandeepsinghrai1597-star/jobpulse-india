import { NextRequest, NextResponse } from "next/server";
import { runJobFetchScheduler } from "@/server/job-fetcher/scheduler";
import { rejectUnauthorizedCronRequest } from "@/lib/api/cron-auth";

export const maxDuration = 55;

export async function GET(request: NextRequest) {
  const unauthorizedResponse = rejectUnauthorizedCronRequest(request);
  if (unauthorizedResponse) return unauthorizedResponse;

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
      totalPublished: accumulator.totalPublished + (result.totalPublished ?? 0),
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
      totalPublished: 0,
    },
  );

  return NextResponse.json({
    ok: summary.failedSources === 0,
    fetchedAt: new Date().toISOString(),
    summary,
    note: "Quality-gated jobs are auto-published to the live board; the rest stay in pending_review for admin approval.",
  });
}
