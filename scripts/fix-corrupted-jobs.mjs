import { createClient } from "@supabase/supabase-js";

const invalidUrlPatterns = [
  "grok.com",
  "/apply/data-scientist",
  "hkrn-cnc-operator",
  "pgimer-recruitment",
  "sgpgi-non-teaching",
];

const proseLocationPatterns = [
  /\bhistory,\s*culture,\s*festivals\b/i,
  /\b(click here|read more|apply online|official notification)\b/i,
];

function isBadUrl(value) {
  if (!value) return false;
  const lowered = String(value).toLowerCase();
  return invalidUrlPatterns.some((pattern) => lowered.includes(pattern));
}

function isBadLocation(value) {
  if (!value) return false;
  const trimmed = String(value).replace(/\s+/g, " ").trim();
  return trimmed.split(/\s+/).length > 5 || proseLocationPatterns.some((pattern) => pattern.test(trimmed));
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function cleanupJobs(supabase) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, slug, title, application_url, source_url, city, state")
    .or(
      [
        ...invalidUrlPatterns.flatMap((pattern) => [
          `application_url.ilike.%${pattern}%`,
          `source_url.ilike.%${pattern}%`,
        ]),
        "city.ilike.%history, culture, festivals%",
        "state.ilike.%history, culture, festivals%",
      ].join(","),
    );

  if (error) throw error;

  let updated = 0;
  for (const row of data ?? []) {
    const patch = {};
    if (isBadUrl(row.application_url)) patch.application_url = null;
    if (isBadUrl(row.source_url)) patch.source_url = null;
    if (isBadLocation(row.city)) patch.city = null;
    if (isBadLocation(row.state)) patch.state = null;

    if (Object.keys(patch).length > 0) {
      const { error: updateError } = await supabase.from("jobs").update(patch).eq("id", row.id);
      if (updateError) throw updateError;
      updated += 1;
      console.log(`Cleaned jobs/${row.slug ?? row.id}: ${row.title}`);
    }
  }

  return updated;
}

async function cleanupGovernmentJobs(supabase) {
  const { data, error } = await supabase
    .from("government_jobs")
    .select("id, slug, title, notification_url, official_apply_url, source_url, state")
    .or(
      [
        ...invalidUrlPatterns.flatMap((pattern) => [
          `notification_url.ilike.%${pattern}%`,
          `official_apply_url.ilike.%${pattern}%`,
          `source_url.ilike.%${pattern}%`,
        ]),
        "state.ilike.%history, culture, festivals%",
      ].join(","),
    );

  if (error) throw error;

  let updated = 0;
  for (const row of data ?? []) {
    const patch = {};
    if (isBadUrl(row.notification_url)) patch.notification_url = null;
    if (isBadUrl(row.official_apply_url)) patch.official_apply_url = null;
    if (isBadUrl(row.source_url)) patch.source_url = null;
    if (isBadLocation(row.state)) patch.state = null;

    if (Object.keys(patch).length > 0) {
      const { error: updateError } = await supabase.from("government_jobs").update(patch).eq("id", row.id);
      if (updateError) throw updateError;
      updated += 1;
      console.log(`Cleaned government_jobs/${row.slug ?? row.id}: ${row.title}`);
    }
  }

  return updated;
}

const supabase = getSupabase();
const [jobsUpdated, governmentJobsUpdated] = await Promise.all([
  cleanupJobs(supabase),
  cleanupGovernmentJobs(supabase),
]);

console.log(`Done. Updated ${jobsUpdated} jobs and ${governmentJobsUpdated} government jobs.`);
