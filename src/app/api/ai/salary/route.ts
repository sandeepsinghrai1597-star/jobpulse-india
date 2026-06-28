import { NextResponse } from "next/server";
import { generateStructuredAiResponse } from "@/lib/ai/gemini";
import { checkAiRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { getUnifiedJobs } from "@/lib/jobs/live";
import {
  buildSalaryCalculatorResult,
  normalizeSalaryCalculatorInput,
  type SalaryDataRow,
} from "@/lib/salary/calculator";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

async function fetchSalaryRows(jobRole: string, city: string) {
  try {
    const supabase = getSupabaseAdminClient() ?? (await createSupabaseServerClient());

    let titleQuery = supabase
      .from("salary_data")
      .select(
        "id, job_title, city, state, experience_range, salary_min, salary_max, salary_type, source",
      )
      .ilike("job_title", `%${jobRole}%`)
      .limit(24);

    if (city) {
      titleQuery = titleQuery.ilike("city", `%${city}%`);
    }

    const { data: strictRows, error: strictError } = await titleQuery;
    if (!strictError && strictRows && strictRows.length > 0) {
      return strictRows as SalaryDataRow[];
    }

    const { data: roleOnlyRows, error: roleOnlyError } = await supabase
      .from("salary_data")
      .select(
        "id, job_title, city, state, experience_range, salary_min, salary_max, salary_type, source",
      )
      .ilike("job_title", `%${jobRole}%`)
      .limit(24);

    if (!roleOnlyError && roleOnlyRows) {
      return roleOnlyRows as SalaryDataRow[];
    }
  } catch {
    return [];
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkAiRateLimit(getClientIp(request));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit reached. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const input = normalizeSalaryCalculatorInput(body);

    if (!input.jobRole) {
      return NextResponse.json(
        { error: "Job role is required." },
        { status: 400 },
      );
    }

    const [rows, jobs] = await Promise.all([
      fetchSalaryRows(input.jobRole, input.city),
      getUnifiedJobs(),
    ]);

    const aiEstimate =
      rows.length === 0
        ? await generateStructuredAiResponse("salaryEstimateExplainer", {
            jobRole: input.jobRole,
            city: input.city,
            experience: input.experience,
            skills: input.skills,
            education: input.education,
          })
        : null;

    return NextResponse.json(
      buildSalaryCalculatorResult({
        input,
        rows,
        jobs,
        aiEstimate,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate salary right now.",
      },
      { status: 500 },
    );
  }
}
