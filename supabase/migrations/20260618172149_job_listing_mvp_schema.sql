do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_status'
      and e.enumlabel = 'flagged'
  ) then
    alter type public.job_status add value 'flagged';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_type'
      and e.enumlabel = 'full_time'
  ) then
    alter type public.job_type add value 'full_time';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'job_type'
      and e.enumlabel = 'part_time'
  ) then
    alter type public.job_type add value 'part_time';
  end if;
end
$$;

alter table public.companies
  add column if not exists is_verified boolean not null default false;

update public.companies
set is_verified = verified
where is_verified is distinct from verified;

alter table public.jobs
  add column if not exists apply_url text,
  add column if not exists experience_min integer,
  add column if not exists experience_max integer,
  add column if not exists is_verified boolean not null default false,
  add column if not exists expires_at timestamptz;

update public.jobs
set
  apply_url = coalesce(apply_url, application_url),
  is_verified = coalesce(is_verified, false) or coalesce(government_source_verified, false),
  expires_at = coalesce(expires_at, deadline::timestamptz);

alter table public.applications
  add column if not exists user_id uuid references public.users(id) on delete cascade;

update public.applications a
set user_id = cp.user_id
from public.candidate_profiles cp
where a.candidate_id = cp.id
  and a.user_id is null;

alter table public.applications
  alter column user_id set not null;

alter table public.job_reports
  add column if not exists user_id uuid references public.users(id) on delete set null;

update public.job_reports
set user_id = coalesce(user_id, reported_by)
where user_id is null;

create or replace function public.sync_company_mvp_fields()
returns trigger
language plpgsql
as $$
begin
  new.is_verified := coalesce(new.is_verified, false) or coalesce(new.verified, false);
  new.verified := new.is_verified;
  return new;
end;
$$;

create or replace function public.sync_job_mvp_fields()
returns trigger
language plpgsql
as $$
begin
  new.application_url := coalesce(new.apply_url, new.application_url);
  new.apply_url := new.application_url;
  return new;
end;
$$;

create or replace function public.sync_application_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null and new.candidate_id is not null then
    select cp.user_id
    into new.user_id
    from public.candidate_profiles cp
    where cp.id = new.candidate_id;
  end if;

  return new;
end;
$$;

create or replace function public.sync_job_report_user_id()
returns trigger
language plpgsql
as $$
begin
  new.user_id := coalesce(new.user_id, new.reported_by);
  new.reported_by := new.user_id;
  return new;
end;
$$;

drop trigger if exists public_companies_sync_mvp_fields on public.companies;
create trigger public_companies_sync_mvp_fields
before insert or update on public.companies
for each row execute function public.sync_company_mvp_fields();

drop trigger if exists public_jobs_sync_mvp_fields on public.jobs;
create trigger public_jobs_sync_mvp_fields
before insert or update on public.jobs
for each row execute function public.sync_job_mvp_fields();

drop trigger if exists public_applications_sync_user_id on public.applications;
create trigger public_applications_sync_user_id
before insert or update on public.applications
for each row execute function public.sync_application_user_id();

drop trigger if exists public_job_reports_sync_user_id on public.job_reports;
create trigger public_job_reports_sync_user_id
before insert or update on public.job_reports
for each row execute function public.sync_job_report_user_id();

create index if not exists jobs_title_idx
  on public.jobs (title);

create index if not exists jobs_city_idx
  on public.jobs (city);

create index if not exists jobs_state_idx
  on public.jobs (state);

create index if not exists jobs_status_idx
  on public.jobs (status);

create index if not exists jobs_created_at_idx
  on public.jobs (created_at desc);

create index if not exists jobs_skills_idx
  on public.jobs using gin (skills);

create index if not exists jobs_work_mode_mvp_idx
  on public.jobs (work_mode);

create unique index if not exists applications_job_user_unique_idx
  on public.applications (job_id, user_id);

create index if not exists applications_user_id_idx
  on public.applications (user_id, created_at desc);

create index if not exists job_reports_user_id_idx
  on public.job_reports (user_id, created_at desc);

drop policy if exists "public read active jobs" on public.jobs;
create policy "public read active jobs"
on public.jobs for select
using (status = 'active');

drop policy if exists "admins manage all jobs" on public.jobs;
create policy "admins manage all jobs"
on public.jobs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users manage own applications" on public.applications;
create policy "users manage own applications"
on public.applications for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own job reports" on public.job_reports;
create policy "users manage own job reports"
on public.job_reports for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());
