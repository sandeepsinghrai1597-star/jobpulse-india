create table if not exists public.job_match_scores (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  matching_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  recommendation text not null,
  reason text not null,
  candidate_updated_at timestamptz,
  job_updated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(candidate_id, job_id)
);

create index if not exists job_match_scores_candidate_idx
  on public.job_match_scores (candidate_id, updated_at desc);

create index if not exists job_match_scores_job_idx
  on public.job_match_scores (job_id, updated_at desc);

create or replace function public.touch_job_match_scores_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists public_job_match_scores_touch_updated_at on public.job_match_scores;
create trigger public_job_match_scores_touch_updated_at
before update on public.job_match_scores
for each row execute function public.touch_job_match_scores_updated_at();

grant select, insert, update, delete on public.job_match_scores to authenticated;

alter table public.job_match_scores enable row level security;

drop policy if exists "users manage own job match scores" on public.job_match_scores;
create policy "users manage own job match scores"
on public.job_match_scores for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = candidate_id
      and cp.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = candidate_id
      and cp.user_id = auth.uid()
  )
);
