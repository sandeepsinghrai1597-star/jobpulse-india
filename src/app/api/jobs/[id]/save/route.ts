import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { ensurePersistedJobByIdentifier } from "@/lib/jobs/persistence";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to save jobs.", redirectTo: `/login?next=/jobs/${identifier}` },
      { status: 401 },
    );
  }

  const persistedJob = await ensurePersistedJobByIdentifier(identifier);
  if (!persistedJob.id || !persistedJob.job) {
    return NextResponse.json({ message: persistedJob.message ?? "Job not found." }, { status: 404 });
  }

  const { data: existingSave } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", persistedJob.id)
    .maybeSingle();
  const existingSaveRow = existingSave as { id: string } | null;

  if (existingSaveRow?.id) {
    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("id", existingSaveRow.id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { message: "We could not update this saved job right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      saved: false,
      message: "Job removed from your saved list.",
    });
  }

  const { error } = await supabase.from("saved_jobs").insert(
    {
      user_id: user.id,
      job_id: persistedJob.id,
    } as never,
  );

  if (error) {
    return NextResponse.json(
      { message: "We could not save this job right now." },
      { status: 500 },
    );
  }

  await recordAnalyticsEvent({
    userId: user.id,
    jobId: persistedJob.id,
    eventName: "job_saved",
    eventData: {
      jobIdentifier: identifier,
      jobSlug: persistedJob.job.slug,
      sourceType: persistedJob.job.sourceType ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    saved: true,
    message: "Job saved to your dashboard shortlist.",
  });
}
