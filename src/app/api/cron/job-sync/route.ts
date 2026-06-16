import { NextResponse } from "next/server";
import { syncOfficialSources } from "@/lib/jobs/live";

export async function GET() {
  const result = await syncOfficialSources();

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    strategy: "verified-source only",
    processed: result.jobs.length,
    sources: result.sources,
    note: result.note,
    jobs: result.jobs,
  });
}
