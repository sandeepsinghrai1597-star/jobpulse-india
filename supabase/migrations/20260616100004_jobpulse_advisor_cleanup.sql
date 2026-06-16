create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists analytics_events_user_id_idx
  on public.analytics_events (user_id);

create index if not exists jobs_employer_id_idx
  on public.jobs (employer_id);

create index if not exists resume_analyses_resume_id_idx
  on public.resume_analyses (resume_id);

create index if not exists saved_jobs_job_id_idx
  on public.saved_jobs (job_id);
