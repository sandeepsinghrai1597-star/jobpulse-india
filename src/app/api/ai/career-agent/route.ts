import { NextResponse } from "next/server";
import {
  buildCareerAgentResponse,
  buildNeedsContextResponse,
  careerAgentRequestSchema,
  getMissingCareerContext,
  type CareerAgentJob,
} from "@/lib/ai/career-agent";
import { recordAnalyticsEvent } from "@/lib/analytics/server";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CareerAgentJobRow = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  description: string | null;
  skills: string[] | null;
  city: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

const JOB_LOOKUP_TIMEOUT_MS = 4000;

async function checkCareerAgentRateLimit(request: Request) {
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? undefined;
  } catch {
    userId = undefined;
  }
  return checkAiRateLimit(getClientIp(request), userId);
}

async function loadCareerAgentJobs(): Promise<CareerAgentJob[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const result = await Promise.race([
    admin
      .from("jobs")
      .select(
        "id, slug, title, company_name, description, skills, city, salary_min, salary_max",
      )
      .eq("status", "active")
      .eq("approval_status", "approved")
      .order("updated_at", { ascending: false })
      .limit(50),
    new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(
        () => resolve({ data: null, error: new Error("Career-agent job lookup timed out.") }),
        JOB_LOOKUP_TIMEOUT_MS,
      ),
    ),
  ]);

  const { data, error } = result;

  if (error || !data) {
    return [];
  }

  return (data as CareerAgentJobRow[]).map((job) => ({
    id: String(job.id),
    slug: String(job.slug),
    title: String(job.title),
    company_name: String(job.company_name),
    description: String(job.description ?? ""),
    skills: Array.isArray(job.skills) ? job.skills.filter(Boolean).map(String) : [],
    city: typeof job.city === "string" ? job.city : null,
    salary_min: typeof job.salary_min === "number" ? job.salary_min : null,
    salary_max: typeof job.salary_max === "number" ? job.salary_max : null,
  }));
}

export async function POST(request: Request) {
  const limit = await checkCareerAgentRateLimit(request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many career-agent requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = careerAgentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const missingContext = getMissingCareerContext(parsed.data.context);
  if (missingContext.length > 0) {
    return NextResponse.json(buildNeedsContextResponse(missingContext));
  }

  const jobs = await loadCareerAgentJobs();
  const result = await buildCareerAgentResponse({
    context: parsed.data.context,
    messages: parsed.data.messages,
    jobs,
  });

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  await recordAnalyticsEvent({
    userId,
    eventName: "ai_career_agent_used",
    eventData: {
      preferredRole: parsed.data.context.preferredRole,
      city: parsed.data.context.city,
      messageCount: parsed.data.messages.length,
      matchedJobCount: "matching_jobs" in result ? result.matching_jobs.length : 0,
    },
  });

  return NextResponse.json(result);
}
