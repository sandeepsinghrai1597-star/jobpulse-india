import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEventPayload } from "@/lib/analytics/events";

export async function recordAnalyticsEvent(payload: AnalyticsEventPayload) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return { ok: false as const, reason: "missing_admin_client" };
  }

  const { error } = await admin.from("analytics_events").insert({
    user_id: payload.userId ?? null,
    candidate_id: payload.candidateId ?? null,
    employer_id: payload.employerId ?? null,
    job_id: payload.jobId ?? null,
    payment_id: payload.paymentId ?? null,
    session_id: payload.sessionId ?? null,
    event_name: payload.eventName,
    event_data: payload.eventData ?? {},
  } as never);

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

