create table if not exists public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type public.source_type not null,
  transport_type text not null check (
    transport_type in ('rss', 'api', 'csv', 'html', 'greenhouse', 'lever', 'workday', 'government')
  ),
  source_url text not null unique,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  allow_auto_fetch boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  notes text,
  last_fetched_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_fetch_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources(id) on delete cascade,
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'failed')),
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'cron', 'api')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  fetched_count integer not null default 0,
  parsed_count integer not null default 0,
  pending_review_count integer not null default 0,
  duplicate_count integer not null default 0,
  error_message text,
  meta jsonb not null default '{}'::jsonb
);

create table if not exists public.job_ingestion_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources(id) on delete cascade,
  fetch_run_id uuid references public.job_fetch_runs(id) on delete set null,
  source_job_key text,
  source_type public.source_type not null,
  source_url text not null,
  application_url text,
  title text not null,
  company_name text not null,
  city text,
  state text,
  country text not null default 'India',
  description text not null default '',
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  job_type public.job_type,
  work_mode public.work_mode,
  salary_type public.salary_type,
  salary_min integer,
  salary_max integer,
  education_required text,
  experience_required text,
  experience_min integer,
  experience_max integer,
  industry text,
  openings integer,
  deadline date,
  recruiter_contact text,
  company_website text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  enrichment_payload jsonb not null default '{}'::jsonb,
  dedupe_fingerprint text not null,
  dedupe_status text not null default 'new' check (
    dedupe_status in ('new', 'duplicate_existing_job', 'duplicate_ingestion_item', 'needs_review')
  ),
  duplicate_of_job_id uuid references public.jobs(id) on delete set null,
  duplicate_of_ingestion_item_id uuid references public.job_ingestion_items(id) on delete set null,
  review_status text not null default 'pending_review' check (
    review_status in ('pending_review', 'approved', 'rejected', 'published')
  ),
  review_notes text,
  approved_by uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references public.users(id) on delete set null,
  rejected_at timestamptz,
  published_job_id uuid references public.jobs(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_sources_status_idx
  on public.job_sources (status, allow_auto_fetch, updated_at desc);

create index if not exists job_fetch_runs_source_started_idx
  on public.job_fetch_runs (source_id, started_at desc);

create index if not exists job_ingestion_items_review_idx
  on public.job_ingestion_items (review_status, created_at desc);

create index if not exists job_ingestion_items_source_idx
  on public.job_ingestion_items (source_id, created_at desc);

create index if not exists job_ingestion_items_dedupe_idx
  on public.job_ingestion_items (dedupe_fingerprint);

create unique index if not exists job_ingestion_items_source_job_key_idx
  on public.job_ingestion_items (source_id, source_job_key)
  where source_job_key is not null;

alter table public.job_sources enable row level security;
alter table public.job_fetch_runs enable row level security;
alter table public.job_ingestion_items enable row level security;

drop policy if exists "admins manage job sources" on public.job_sources;
create policy "admins manage job sources"
on public.job_sources for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage job fetch runs" on public.job_fetch_runs;
create policy "admins manage job fetch runs"
on public.job_fetch_runs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage job ingestion items" on public.job_ingestion_items;
create policy "admins manage job ingestion items"
on public.job_ingestion_items for all
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists public_job_sources_set_updated_at on public.job_sources;
create trigger public_job_sources_set_updated_at
before update on public.job_sources
for each row execute function public.set_updated_at();

drop trigger if exists public_job_ingestion_items_set_updated_at on public.job_ingestion_items;
create trigger public_job_ingestion_items_set_updated_at
before update on public.job_ingestion_items
for each row execute function public.set_updated_at();
