import type { Job } from "@/types";
import { getUnifiedJobByIdentifier, jobToDbRow } from "@/lib/jobs/live";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensurePersistedJobByIdentifier(identifier: string): Promise<{
  id: string | null;
  job: Job | null;
  message: string | null;
}> {
  const unifiedJob = await getUnifiedJobByIdentifier(identifier);

  if (!unifiedJob) {
    return { id: null, job: null, message: "Job not found." };
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return {
      id: null,
      job: unifiedJob,
      message: "This environment is missing the service role key required to persist jobs.",
    };
  }

  const { data, error } = await admin
    .from("jobs")
    .upsert(jobToDbRow(unifiedJob) as never, { onConflict: "slug" })
    .select("id")
    .single();
  const persistedJob = data as { id: string } | null;

  if (error || !persistedJob?.id) {
    return {
      id: null,
      job: unifiedJob,
      message: "We could not prepare this job right now.",
    };
  }

  return { id: persistedJob.id, job: unifiedJob, message: null };
}
