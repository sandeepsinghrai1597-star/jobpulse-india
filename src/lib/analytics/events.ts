export const analyticsEventNames = [
  "job_view",
  "job_application",
  "job_search",
  "job_saved",
  "resume_upload",
  "resume_analysis",
  "ai_career_agent_used",
  "interview_session_started",
  "whatsapp_subscription",
  "employer_job_post",
  "payment_event",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsEventPayload = {
  eventName: AnalyticsEventName;
  sessionId?: string;
  userId?: string | null;
  candidateId?: string | null;
  employerId?: string | null;
  jobId?: string | null;
  paymentId?: string | null;
  eventData?: Record<string, unknown>;
};

