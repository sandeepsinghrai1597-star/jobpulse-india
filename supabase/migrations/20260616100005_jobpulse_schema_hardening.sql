create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  derived_name text;
  derived_role text;
begin
  derived_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'User'
  );

  derived_role := case
    when coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate') in ('candidate', 'employer', 'admin')
      then coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate')
    else 'candidate'
  end;

  insert into public.users (id, name, email, phone, role)
  values (new.id, derived_name, new.email, new.phone, derived_role)
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

alter table public.users
  add column if not exists updated_at timestamptz not null default now();

alter table public.candidate_profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.employer_profiles
  add column if not exists state text,
  add column if not exists description text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.resumes
  add column if not exists updated_at timestamptz not null default now();

alter table public.resume_analyses
  add column if not exists updated_at timestamptz not null default now();

alter table public.interview_sessions
  add column if not exists updated_at timestamptz not null default now();

alter table public.government_jobs
  add column if not exists updated_at timestamptz not null default now();

alter table public.internships
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.blog_posts
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.seo_pages
  add column if not exists updated_at timestamptz not null default now();

alter table public.payments
  add column if not exists updated_at timestamptz not null default now();

alter table public.analytics_events
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists candidate_profiles_user_id_key
  on public.candidate_profiles (user_id);

create unique index if not exists employer_profiles_user_id_key
  on public.employer_profiles (user_id);

create unique index if not exists saved_jobs_user_id_job_id_key
  on public.saved_jobs (user_id, job_id);

create unique index if not exists applications_job_id_candidate_id_key
  on public.applications (job_id, candidate_id);

create index if not exists jobs_status_approval_updated_idx
  on public.jobs (status, approval_status, updated_at desc);

create index if not exists jobs_city_work_mode_idx
  on public.jobs (city, work_mode);

create index if not exists jobs_source_type_status_idx
  on public.jobs (source_type, status);

create index if not exists applications_candidate_status_idx
  on public.applications (candidate_id, status, updated_at desc);

create index if not exists applications_job_status_idx
  on public.applications (job_id, status, updated_at desc);

create index if not exists resumes_user_updated_idx
  on public.resumes (user_id, updated_at desc);

create index if not exists resume_analyses_user_created_idx
  on public.resume_analyses (user_id, created_at desc);

create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions (user_id, created_at desc);

create index if not exists government_jobs_category_last_date_idx
  on public.government_jobs (category, last_date desc);

create index if not exists internships_work_mode_deadline_idx
  on public.internships (work_mode, deadline);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);

create index if not exists seo_pages_page_type_indexable_idx
  on public.seo_pages (page_type, indexable);

create index if not exists payments_user_status_created_idx
  on public.payments (user_id, status, created_at desc);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event_name, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'public.users',
    'public.candidate_profiles',
    'public.employer_profiles',
    'public.jobs',
    'public.applications',
    'public.resumes',
    'public.resume_analyses',
    'public.interview_sessions',
    'public.government_jobs',
    'public.internships',
    'public.blog_posts',
    'public.seo_pages',
    'public.payments',
    'public.analytics_events'
  ]
  loop
    if not exists (
      select 1
      from pg_trigger
      where tgname = replace(table_name, '.', '_') || '_set_updated_at'
    ) then
      execute format(
        'create trigger %I before update on %s for each row execute function public.set_updated_at()',
        replace(table_name, '.', '_') || '_set_updated_at',
        table_name
      );
    end if;
  end loop;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.sync_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, phone, raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute function private.sync_auth_user();

insert into public.users (id, name, email, phone, role)
select
  au.id,
  coalesce(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1),
    'User'
  ) as name,
  au.email,
  au.phone,
  case
    when coalesce(au.raw_app_meta_data->>'role', au.raw_user_meta_data->>'role', 'candidate') in ('candidate', 'employer', 'admin')
      then coalesce(au.raw_app_meta_data->>'role', au.raw_user_meta_data->>'role', 'candidate')
    else 'candidate'
  end as role
from auth.users au
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'users update own row'
  ) then
    execute 'create policy "users update own row" on public.users for update using (auth.uid() = id) with check (auth.uid() = id)';
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'jobs'
      and policyname = 'employers manage own jobs'
  ) then
    execute $policy$
      create policy "employers manage own jobs"
      on public.jobs
      for all
      using (
        exists (
          select 1
          from public.employer_profiles ep
          where ep.id = jobs.employer_id
            and ep.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.employer_profiles ep
          where ep.id = jobs.employer_id
            and ep.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'jobs'
      and policyname = 'admins manage all jobs'
  ) then
    execute $policy$
      create policy "admins manage all jobs"
      on public.jobs
      for all
      using (
        exists (
          select 1
          from public.users u
          where u.id = auth.uid()
            and u.role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.users u
          where u.id = auth.uid()
            and u.role = 'admin'
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'candidates read own applications'
  ) then
    execute $policy$
      create policy "candidates read own applications"
      on public.applications
      for select
      using (
        exists (
          select 1
          from public.candidate_profiles cp
          where cp.id = applications.candidate_id
            and cp.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'candidates create own applications'
  ) then
    execute $policy$
      create policy "candidates create own applications"
      on public.applications
      for insert
      with check (
        exists (
          select 1
          from public.candidate_profiles cp
          where cp.id = applications.candidate_id
            and cp.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'candidates update own applications'
  ) then
    execute $policy$
      create policy "candidates update own applications"
      on public.applications
      for update
      using (
        exists (
          select 1
          from public.candidate_profiles cp
          where cp.id = applications.candidate_id
            and cp.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.candidate_profiles cp
          where cp.id = applications.candidate_id
            and cp.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'employers review applications on own jobs'
  ) then
    execute $policy$
      create policy "employers review applications on own jobs"
      on public.applications
      for select
      using (
        exists (
          select 1
          from public.jobs j
          join public.employer_profiles ep on ep.id = j.employer_id
          where j.id = applications.job_id
            and ep.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'employers update applications on own jobs'
  ) then
    execute $policy$
      create policy "employers update applications on own jobs"
      on public.applications
      for update
      using (
        exists (
          select 1
          from public.jobs j
          join public.employer_profiles ep on ep.id = j.employer_id
          where j.id = applications.job_id
            and ep.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.jobs j
          join public.employer_profiles ep on ep.id = j.employer_id
          where j.id = applications.job_id
            and ep.user_id = auth.uid()
        )
      )
    $policy$;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and policyname = 'admins manage all applications'
  ) then
    execute $policy$
      create policy "admins manage all applications"
      on public.applications
      for all
      using (
        exists (
          select 1
          from public.users u
          where u.id = auth.uid()
            and u.role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.users u
          where u.id = auth.uid()
            and u.role = 'admin'
        )
      )
    $policy$;
  end if;
end
$$;
