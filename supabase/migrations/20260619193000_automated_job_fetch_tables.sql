alter table public.job_sources
  add column if not exists company_name text,
  add column if not exists industry text,
  add column if not exists location text,
  add column if not exists is_active boolean not null default true,
  add column if not exists fetch_frequency text,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_error text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'job_sources'
      and column_name = 'source_type'
      and udt_name = 'source_type'
  ) then
    alter table public.job_sources
      alter column source_type type text
      using source_type::text;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_sources_source_type_check'
  ) then
    alter table public.job_sources
      add constraint job_sources_source_type_check
      check (
        source_type in (
          'employer',
          'admin',
          'official',
          'partner',
          'company_career_page',
          'government_source',
          'rss_feed',
          'api_feed',
          'csv_upload',
          'employer_feed'
        )
      );
  end if;
end
$$;

update public.job_sources
set is_active = case
  when status = 'active' and allow_auto_fetch then true
  else false
end
where is_active is distinct from case
  when status = 'active' and allow_auto_fetch then true
  else false
end;

create table if not exists public.job_fetch_batches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (
    status in ('running', 'success', 'partial_failed', 'failed')
  ),
  total_found integer not null default 0,
  total_new integer not null default 0,
  total_duplicates integer not null default 0,
  error_message text
);

create table if not exists public.raw_fetched_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.job_sources(id) on delete cascade,
  raw_title text,
  raw_company text,
  raw_location text,
  raw_description text,
  raw_apply_url text,
  raw_salary text,
  raw_experience text,
  raw_job_type text,
  raw_posted_date text,
  raw_deadline text,
  raw_data_json jsonb not null default '{}'::jsonb,
  content_hash text not null,
  fetch_batch_id uuid references public.job_fetch_batches(id) on delete set null,
  status text not null default 'new' check (
    status in ('new', 'duplicate', 'parsed', 'failed')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.normalized_jobs (
  id uuid primary key default gen_random_uuid(),
  raw_job_id uuid not null unique references public.raw_fetched_jobs(id) on delete cascade,
  title text not null,
  slug text not null default '',
  company_name text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  salary_min integer,
  salary_max integer,
  salary_type public.salary_type,
  city text,
  state text,
  country text not null default 'India',
  job_type public.job_type,
  work_mode public.work_mode,
  experience_min integer,
  experience_max integer,
  education_required text,
  industry text,
  openings integer not null default 1,
  deadline date,
  apply_url text,
  source_url text,
  source_type text not null check (
    source_type in (
      'company_career_page',
      'government_source',
      'rss_feed',
      'api_feed',
      'csv_upload',
      'employer_feed'
    )
  ),
  quality_score numeric(5, 2),
  duplicate_score numeric(5, 2),
  status text not null default 'pending_review' check (
    status in ('pending_review', 'approved', 'rejected', 'needs_edit')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs
  add column if not exists normalized_job_id uuid references public.normalized_jobs(id) on delete set null;

create unique index if not exists jobs_normalized_job_id_idx
  on public.jobs (normalized_job_id)
  where normalized_job_id is not null;

create index if not exists job_fetch_batches_source_id_idx
  on public.job_fetch_batches (source_id);

create index if not exists job_fetch_batches_status_idx
  on public.job_fetch_batches (status);

create index if not exists raw_fetched_jobs_source_id_idx
  on public.raw_fetched_jobs (source_id);

create index if not exists raw_fetched_jobs_content_hash_idx
  on public.raw_fetched_jobs (content_hash);

create index if not exists raw_fetched_jobs_status_idx
  on public.raw_fetched_jobs (status);

create index if not exists raw_fetched_jobs_created_at_idx
  on public.raw_fetched_jobs (created_at desc);

create index if not exists normalized_jobs_status_idx
  on public.normalized_jobs (status);

create index if not exists normalized_jobs_city_idx
  on public.normalized_jobs (city);

create index if not exists normalized_jobs_state_idx
  on public.normalized_jobs (state);

create index if not exists normalized_jobs_title_idx
  on public.normalized_jobs (title);

create index if not exists normalized_jobs_company_name_idx
  on public.normalized_jobs (company_name);

create index if not exists normalized_jobs_created_at_idx
  on public.normalized_jobs (created_at desc);

alter table public.job_fetch_batches enable row level security;
alter table public.raw_fetched_jobs enable row level security;
alter table public.normalized_jobs enable row level security;

drop policy if exists "admins manage job fetch batches" on public.job_fetch_batches;
create policy "admins manage job fetch batches"
on public.job_fetch_batches for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage raw fetched jobs" on public.raw_fetched_jobs;
create policy "admins manage raw fetched jobs"
on public.raw_fetched_jobs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage normalized jobs" on public.normalized_jobs;
create policy "admins manage normalized jobs"
on public.normalized_jobs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read active jobs" on public.jobs;
create policy "public read active jobs"
on public.jobs for select
using (status = 'active' and approval_status = 'approved');

grant select, insert, update, delete on
  public.job_sources,
  public.job_fetch_batches,
  public.raw_fetched_jobs,
  public.normalized_jobs
to authenticated;

grant all privileges on
  public.job_sources,
  public.job_fetch_batches,
  public.raw_fetched_jobs,
  public.normalized_jobs
to service_role;

create or replace function private.slugify_text(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function private.canonical_job_source_type(input text)
returns public.source_type
language sql
immutable
as $$
  select case input
    when 'company_career_page' then 'employer'::public.source_type
    when 'employer_feed' then 'employer'::public.source_type
    when 'government_source' then 'official'::public.source_type
    else 'partner'::public.source_type
  end
$$;

create or replace function private.generate_unique_job_slug(
  input_title text,
  input_company_name text,
  input_city text,
  existing_job_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 0;
begin
  base_slug := private.slugify_text(concat_ws(' ', input_title, input_company_name, input_city));

  if base_slug = '' then
    base_slug := 'job';
  end if;

  candidate := left(base_slug, 80);

  while exists (
    select 1
    from public.jobs
    where slug = candidate
      and (existing_job_id is null or id <> existing_job_id)
  ) loop
    suffix := suffix + 1;
    candidate := left(base_slug, greatest(1, 80 - length(suffix::text) - 1)) || '-' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function private.prepare_normalized_job_slug()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(
    nullif(private.slugify_text(new.slug), ''),
    nullif(private.slugify_text(concat_ws(' ', new.title, new.company_name, new.city)), ''),
    'job'
  );

  new.slug := left(new.slug, 80);
  return new;
end;
$$;

create or replace function private.sync_approved_normalized_job_to_public_jobs()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  target_job_id uuid;
  target_slug text;
  experience_required_text text;
begin
  if new.status <> 'approved' then
    return new;
  end if;

  select id
  into target_job_id
  from public.jobs
  where normalized_job_id = new.id
  limit 1;

  experience_required_text := case
    when new.experience_min is not null and new.experience_max is not null then
      new.experience_min::text || '-' || new.experience_max::text || ' years'
    when new.experience_min is not null then
      new.experience_min::text || '+ years'
    when new.experience_max is not null then
      'Up to ' || new.experience_max::text || ' years'
    else null
  end;

  if target_job_id is null then
    target_slug := private.generate_unique_job_slug(new.title, new.company_name, new.city, null);

    insert into public.jobs (
      normalized_job_id,
      title,
      slug,
      company_name,
      description,
      responsibilities,
      requirements,
      skills,
      salary_min,
      salary_max,
      salary_type,
      city,
      state,
      country,
      location,
      job_type,
      work_mode,
      education_required,
      experience_required,
      experience_min,
      experience_max,
      industry,
      openings,
      status,
      approval_status,
      no_candidate_payment,
      salary_disclosed,
      government_source_verified,
      is_verified,
      apply_url,
      application_url,
      deadline,
      source_type,
      source_url,
      import_source,
      approved_at,
      published_at
    )
    values (
      new.id,
      new.title,
      target_slug,
      new.company_name,
      new.description,
      new.responsibilities,
      new.requirements,
      new.skills,
      new.salary_min,
      new.salary_max,
      coalesce(new.salary_type, 'yearly'::public.salary_type),
      new.city,
      new.state,
      coalesce(new.country, 'India'),
      trim(both ', ' from concat_ws(', ', new.city, new.state)),
      new.job_type,
      new.work_mode,
      new.education_required,
      experience_required_text,
      new.experience_min,
      new.experience_max,
      new.industry,
      coalesce(new.openings, 1),
      'active'::public.job_status,
      'approved'::public.approval_status,
      true,
      coalesce(new.salary_min, 0) > 0 or coalesce(new.salary_max, 0) > 0,
      new.source_type = 'government_source',
      new.source_type = 'government_source',
      new.apply_url,
      new.apply_url,
      new.deadline,
      private.canonical_job_source_type(new.source_type),
      new.source_url,
      'automated_fetch',
      now(),
      now()
    )
    returning id into target_job_id;
  else
    update public.jobs as existing
    set
      title = new.title,
      company_name = new.company_name,
      description = new.description,
      responsibilities = new.responsibilities,
      requirements = new.requirements,
      skills = new.skills,
      salary_min = new.salary_min,
      salary_max = new.salary_max,
      salary_type = coalesce(new.salary_type, existing.salary_type),
      city = new.city,
      state = new.state,
      country = coalesce(new.country, existing.country),
      location = trim(both ', ' from concat_ws(', ', new.city, new.state)),
      job_type = new.job_type,
      work_mode = new.work_mode,
      education_required = new.education_required,
      experience_required = experience_required_text,
      experience_min = new.experience_min,
      experience_max = new.experience_max,
      industry = new.industry,
      openings = coalesce(new.openings, existing.openings),
      status = 'active',
      approval_status = 'approved',
      salary_disclosed = coalesce(new.salary_min, 0) > 0 or coalesce(new.salary_max, 0) > 0,
      government_source_verified = new.source_type = 'government_source',
      is_verified = new.source_type = 'government_source',
      apply_url = new.apply_url,
      application_url = new.apply_url,
      deadline = new.deadline,
      source_type = private.canonical_job_source_type(new.source_type),
      source_url = new.source_url,
      import_source = 'automated_fetch',
      approved_at = coalesce(existing.approved_at, now()),
      published_at = coalesce(existing.published_at, now())
    where id = target_job_id;
  end if;

  return new;
end;
$$;

drop trigger if exists public_normalized_jobs_set_updated_at on public.normalized_jobs;
create trigger public_normalized_jobs_set_updated_at
before update on public.normalized_jobs
for each row execute function public.set_updated_at();

drop trigger if exists public_normalized_jobs_prepare_slug on public.normalized_jobs;
create trigger public_normalized_jobs_prepare_slug
before insert or update on public.normalized_jobs
for each row execute function private.prepare_normalized_job_slug();

drop trigger if exists public_normalized_jobs_sync_to_public_jobs on public.normalized_jobs;
create trigger public_normalized_jobs_sync_to_public_jobs
after insert or update on public.normalized_jobs
for each row execute function private.sync_approved_normalized_job_to_public_jobs();

notify pgrst, 'reload schema';
