alter table public.government_jobs
  add column if not exists source_id uuid references public.job_sources(id) on delete set null,
  add column if not exists source_url text,
  add column if not exists official_apply_url text,
  add column if not exists application_fee text,
  add column if not exists status text not null default 'approved' check (
    status in ('pending_review', 'approved', 'rejected')
  ),
  add column if not exists fetch_key text,
  add column if not exists review_notes text,
  add column if not exists approved_by uuid references public.users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejected_by uuid references public.users(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.government_jobs
set
  application_fee = coalesce(application_fee, fees),
  source_url = coalesce(source_url, notification_url, official_url),
  official_apply_url = coalesce(official_apply_url, official_url),
  status = coalesce(status, 'approved');

create unique index if not exists government_jobs_fetch_key_idx
  on public.government_jobs (fetch_key)
  where fetch_key is not null;

create index if not exists government_jobs_status_updated_idx
  on public.government_jobs (status, updated_at desc);
