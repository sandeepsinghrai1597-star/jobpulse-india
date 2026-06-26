const fs = require("fs");
const path = require("path");
const data = require("../src/lib/data/jobpulse-import.json");
const outDir = path.resolve(__dirname, "jobpulse-sql");
fs.mkdirSync(outDir, { recursive: true });
const esc = (v) => String(v).replace(/'/g, "''");
const lit = (v) => (v == null ? "null" : `'${esc(v)}'`);
const textArray = (arr) => arr && arr.length ? `array[${arr.map((v) => `'${esc(v)}'`).join(",")}]::text[]` : "array[]::text[]";
const jsonb = (v, emptyLiteral) => v == null ? emptyLiteral : `'${esc(JSON.stringify(v))}'::jsonb`;
const chunks = [];
for (let i = 0; i < data.length; i += 25) chunks.push(data.slice(i, i + 25));
chunks.forEach((chunk, idx) => {
  const values = chunk.map((row) => {
    const meta = row.metadata || {};
    const important = Array.isArray(meta.importantDates) ? meta.importantDates : [];
    const faq = Array.isArray(meta.faq) ? meta.faq : [];
    return `(${lit(row.fetch_key)}, ${meta.wordpressPostId ?? "null"}, ${lit(row.slug)}, ${lit(row.title)}, ${lit(row.department)}, ${lit(row.category)}, ${lit(row.category_slug)}, ${lit(row.state)}, ${lit(row.eligibility)}, ${lit(row.age_limit)}, ${lit(row.fees)}, ${lit(row.application_fee)}, ${row.last_date ? `${lit(row.last_date)}::date` : "null"}, ${lit(row.official_url)}, ${lit(row.notification_url)}, ${lit(row.official_apply_url)}, ${lit(row.source_url)}, ${lit(row.summary)}, ${lit(meta.openings ?? meta.vacancy ?? null)}, ${lit(meta.salary ?? null)}, ${lit(meta.syllabus ?? null)}, ${lit(meta.selectionProcess ?? null)}, ${textArray(important)}, ${jsonb(faq, "'[]'::jsonb")}, ${jsonb(meta, "'{}'::jsonb")}, 'approved')`;
  }).join(",\n");
  const sql = `insert into public.jobpulse_import_jobs (fetch_key, source_post_id, slug, title, department, category, category_slug, state, eligibility, age_limit, fees, application_fee, last_date, official_url, notification_url, official_apply_url, source_url, summary, openings, salary, syllabus, selection_process, important_dates, faq, metadata, status) values\n${values}\non conflict (slug) do update set\n  fetch_key = excluded.fetch_key,\n  source_post_id = excluded.source_post_id,\n  title = excluded.title,\n  department = excluded.department,\n  category = excluded.category,\n  category_slug = excluded.category_slug,\n  state = excluded.state,\n  eligibility = excluded.eligibility,\n  age_limit = excluded.age_limit,\n  fees = excluded.fees,\n  application_fee = excluded.application_fee,\n  last_date = excluded.last_date,\n  official_url = excluded.official_url,\n  notification_url = excluded.notification_url,\n  official_apply_url = excluded.official_apply_url,\n  source_url = excluded.source_url,\n  summary = excluded.summary,\n  openings = excluded.openings,\n  salary = excluded.salary,\n  syllabus = excluded.syllabus,\n  selection_process = excluded.selection_process,\n  important_dates = excluded.important_dates,\n  faq = excluded.faq,\n  metadata = excluded.metadata,\n  status = excluded.status,\n  updated_at = now();`;
  fs.writeFileSync(path.join(outDir, `batch-${String(idx + 1).padStart(2, "0")}.sql`), sql, "utf8");
});
console.log(chunks.length);