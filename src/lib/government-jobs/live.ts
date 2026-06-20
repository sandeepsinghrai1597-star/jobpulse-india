import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { GovernmentJob } from "@/types";
import {
  getGovernmentJobBySlug as getStaticGovernmentJobBySlug,
  getGovernmentJobCategoryBySlug,
  getGovernmentJobsByCategory as getStaticGovernmentJobsByCategory,
  governmentJobCategories,
  governmentJobs as staticGovernmentJobs,
} from "@/lib/data/government-jobs";

type GovernmentJobRow = {
  id: string;
  slug: string;
  category_slug: string | null;
  title: string;
  department: string;
  category: string;
  state: string | null;
  eligibility: string | null;
  age_limit: string | null;
  fees: string | null;
  application_fee?: string | null;
  last_date: string | null;
  official_url: string | null;
  notification_url: string | null;
  official_apply_url?: string | null;
  source_url?: string | null;
  summary: string | null;
  status?: string | null;
};

function rowToGovernmentJob(row: GovernmentJobRow): GovernmentJob {
  const status = (row.status ?? "approved") as "pending_review" | "approved" | "rejected";

  return {
    id: row.id,
    slug: row.slug,
    categorySlug: row.category_slug ?? undefined,
    title: row.title,
    department: row.department,
    category: row.category,
    state: row.state ?? "All India",
    eligibility: row.eligibility ?? "Verify on official website",
    ageLimit: row.age_limit ?? "Verify on official website",
    applicationFee: row.application_fee ?? row.fees ?? "Verify on official website",
    lastDate: row.last_date ?? "Check official notification",
    officialNotificationLink: row.notification_url ?? row.official_url ?? undefined,
    applyLink: row.official_apply_url ?? row.official_url ?? undefined,
    summary: row.summary ?? "Official government job update pending detailed editorial enrichment.",
    notificationUrl: row.notification_url ?? undefined,
    officialUrl: row.official_url ?? undefined,
    officialApplyUrl: row.official_apply_url ?? undefined,
    sourceUrl: row.source_url ?? row.official_url ?? undefined,
    status,
  };
}

async function getGovernmentJobsClient() {
  return getSupabaseAdminClient() ?? (await createClient());
}

export async function getApprovedGovernmentJobs() {
  try {
    const client = await getGovernmentJobsClient();
    const { data, error } = await client
      .from("government_jobs")
      .select(
        "id, slug, category_slug, title, department, category, state, eligibility, age_limit, fees, application_fee, last_date, official_url, notification_url, official_apply_url, source_url, summary, status",
      )
      .eq("status", "approved")
      .order("last_date", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return staticGovernmentJobs;
    }

    return (data as GovernmentJobRow[]).map(rowToGovernmentJob);
  } catch {
    return staticGovernmentJobs;
  }
}

export async function getGovernmentJobBySlug(slug: string) {
  const jobs = await getApprovedGovernmentJobs();
  return jobs.find((job) => job.slug === slug) ?? getStaticGovernmentJobBySlug(slug);
}

export async function getGovernmentJobsByCategory(categorySlug: string) {
  const jobs = await getApprovedGovernmentJobs();
  const filtered = jobs.filter((job) => job.categorySlug === categorySlug);
  return filtered.length > 0 ? filtered : getStaticGovernmentJobsByCategory(categorySlug);
}

export async function getRelatedGovernmentJobs(currentSlug: string, categorySlug: string) {
  const jobs = await getGovernmentJobsByCategory(categorySlug);
  return jobs.filter((job) => job.slug !== currentSlug).slice(0, 6);
}

export async function getGovernmentSegments() {
  const jobs = await getApprovedGovernmentJobs();
  return [
    ...governmentJobCategories.map((category) => category.slug),
    ...jobs.map((job) => job.slug),
  ];
}

export { governmentJobCategories, getGovernmentJobCategoryBySlug };
