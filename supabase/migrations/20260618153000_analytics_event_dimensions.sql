alter table public.analytics_events
  add column if not exists candidate_id uuid references public.candidate_profiles(id) on delete set null,
  add column if not exists employer_id uuid references public.employer_profiles(id) on delete set null,
  add column if not exists job_id uuid references public.jobs(id) on delete set null,
  add column if not exists payment_id uuid references public.payments(id) on delete set null;

create index if not exists analytics_events_job_event_created_idx
  on public.analytics_events (job_id, event_name, created_at desc);

create index if not exists analytics_events_employer_event_created_idx
  on public.analytics_events (employer_id, event_name, created_at desc);

create index if not exists analytics_events_candidate_event_created_idx
  on public.analytics_events (candidate_id, event_name, created_at desc);

create index if not exists analytics_events_payment_event_created_idx
  on public.analytics_events (payment_id, event_name, created_at desc);
