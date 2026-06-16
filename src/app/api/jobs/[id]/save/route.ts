import { NextResponse } from "next/server";
import { getUnifiedJobByIdentifier, jobToDbRow } from "@/lib/jobs/live";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to save jobs." },
      { status: 401 },
    );
  }

  const job = await getUnifiedJobByIdentifier(identifier);
  if (!job) {
    return NextResponse.json({ message: "Job not found." }, { status: 404 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { message: "Saving jobs requires Supabase service role configuration." },
      { status: 503 },
    );
  }

  const jobResult = await admin
    .from("jobs")
    .upsert(jobToDbRow(job) as never, { onConflict: "slug" })
    .select("id")
    .single();
  const persistedJob = jobResult.data as { id: string } | null;
  const jobError = jobResult.error;

  if (jobError || !persistedJob?.id) {
    return NextResponse.json(
      { message: "We could not prepare this job for saving." },
      { status: 500 },
    );
  }

  const { error } = await admin.from("saved_jobs").upsert(
    {
      user_id: user.id,
      job_id: persistedJob.id,
    } as never,
    { onConflict: "user_id,job_id" },
  );

  if (error) {
    return NextResponse.json(
      { message: "We could not save this job right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Job saved to your dashboard shortlist.",
  });
}
