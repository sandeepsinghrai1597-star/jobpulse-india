import { NextResponse } from "next/server";
import { z } from "zod";
import { getUnifiedJobByIdentifier, jobToDbRow } from "@/lib/jobs/live";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(1000).optional().default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: identifier } = await params;
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Please choose a valid report reason." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "Reporting is not configured right now." }, { status: 503 });
  }

  const job = await getUnifiedJobByIdentifier(identifier);
  if (!job) {
    return NextResponse.json({ message: "Job not found." }, { status: 404 });
  }

  const jobResult = await admin
    .from("jobs")
    .upsert(jobToDbRow(job) as never, { onConflict: "slug" })
    .select("id")
    .single();

  const persistedJob = jobResult.data as { id: string } | null;
  if (jobResult.error || !persistedJob?.id) {
    return NextResponse.json({ message: "We could not prepare this report." }, { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("job_reports").insert({
    job_id: persistedJob.id,
    reported_by: user?.id ?? null,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  } as never);

  if (error) {
    return NextResponse.json({ message: "We could not submit this report." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks. Our team will review this listing for scam or fake-job signals.",
  });
}
