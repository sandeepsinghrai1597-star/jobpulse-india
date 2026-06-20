import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type EmployerAccess =
  | {
      ok: true;
      user: CurrentUser;
      admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
      employerProfileId: string;
      companyName: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type EmployerProfileAccessRow = {
  id: string;
  company_name: string;
};

type JobAccessRow = {
  id: string;
  employer_id: string | null;
  title: string;
};

export async function getEmployerAccess(): Promise<EmployerAccess> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, status: 401, message: "Please sign in first." };
  }

  if (user.role !== "employer" && user.role !== "admin") {
    return { ok: false, status: 403, message: "Only employers can manage jobs." };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return {
      ok: false,
      status: 503,
      message: "Supabase admin configuration is required for employer actions.",
    };
  }

  const { data: profile, error } = await admin
    .from("employer_profiles")
    .select("id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, message: "We could not verify your employer profile." };
  }

  const employerProfile = profile as EmployerProfileAccessRow | null;

  if (!employerProfile?.id) {
    return {
      ok: false,
      status: 400,
      message: "Complete your company profile before managing jobs.",
    };
  }

  return {
    ok: true,
    user,
    admin,
    employerProfileId: employerProfile.id,
    companyName: employerProfile.company_name,
  };
}

export async function assertOwnJob(jobId: string) {
  const access = await getEmployerAccess();
  if (!access.ok) {
    return access;
  }

  const { data: job, error } = await access.admin
    .from("jobs")
    .select("id, employer_id, title")
    .eq("id", jobId)
    .eq("employer_id", access.employerProfileId)
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500, message: "We could not verify this job." };
  }

  const ownJob = job as JobAccessRow | null;

  if (!ownJob) {
    return {
      ok: false as const,
      status: 404,
      message: "Job not found, or you do not have permission to manage it.",
    };
  }

  return { ...access, job: ownJob };
}
