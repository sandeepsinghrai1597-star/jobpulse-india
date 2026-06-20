create extension if not exists pgcrypto;
create schema if not exists private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('candidate', 'employer', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type public.job_status as enum ('draft', 'pending', 'active', 'expired', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum ('applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'offered');
  end if;

  if not exists (select 1 from pg_type where typname = 'work_mode') then
    create type public.work_mode as enum ('remote', 'hybrid', 'onsite');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_type') then
    create type public.job_type as enum ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'walk-in');
  end if;

  if not exists (select 1 from pg_type where typname = 'salary_type') then
    create type public.salary_type as enum ('monthly', 'yearly', 'stipend');
  end if;

  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum ('draft', 'pending', 'verified', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type public.source_type as enum ('employer', 'admin', 'official', 'partner');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('created', 'paid', 'failed', 'refunded', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('active', 'paused', 'unsubscribed');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('system', 'job_alert', 'application', 'payment', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type public.notification_channel as enum ('in_app', 'email', 'whatsapp');
  end if;

  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'published', 'rejected');
  end if;
end
$$;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select role::public.app_role
  from public.users
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role() = 'admin', false)
$$;

create or replace function public.is_candidate()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role() = 'candidate', false)
$$;

create or replace function public.is_employer()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_role() = 'employer', false)
$$;

create or replace function private.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  derived_name text;
  derived_role public.app_role;
begin
  derived_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'User'
  );

  derived_role := case
    when new.raw_app_meta_data->>'role' = 'admin'
      then 'admin'::public.app_role
    when coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate') in ('candidate', 'employer')
      then coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate')::public.app_role
    else 'candidate'::public.app_role
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

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'candidate',
  is_banned boolean not null default false,
  current_plan text not null default 'free',
  subscription_status public.subscription_status not null default 'active',
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  website text,
  industry text,
  city text,
  state text,
  country text not null default 'India',
  size_range text,
  description text,
  is_verified boolean not null default false,
  verified boolean not null default false,
  rating numeric(3,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  full_name text,
  phone text,
  headline text,
  bio text,
  education text,
  skills text[] not null default '{}',
  experience text,
  city text,
  state text,
  preferred_roles text[] not null default '{}',
  expected_salary integer,
  preferred_job_types text[] not null default '{}',
  language_preference text default 'English',
  resume_url text,
  verified boolean not null default false,
  verification_status public.verification_status not null default 'draft',
  verification_requested_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  company_name text not null,
  company_email text,
  company_email_verified boolean not null default false,
  domain_verification_status text not null default 'pending',
  logo_url text,
  website text,
  industry text,
  city text,
  state text,
  recruiter_name text,
  recruiter_phone text,
  description text,
  verified boolean not null default false,
  approval_status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  employer_id uuid references public.employer_profiles(id) on delete set null,
  category_slug text,
  title text not null,
  slug text not null unique,
  company_name text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  skills text[] not null default '{}',
  salary_min integer,
  salary_max integer,
  salary_type public.salary_type not null default 'yearly',
  city text,
  state text,
  country text not null default 'India',
  location text,
  job_type public.job_type,
  work_mode public.work_mode,
  education_required text,
  experience_required text,
  experience_min integer,
  experience_max integer,
  industry text,
  openings integer not null default 1,
  recruiter_contact text,
  status public.job_status not null default 'draft',
  approval_status public.approval_status not null default 'pending',
  no_candidate_payment boolean not null default true,
  salary_disclosed boolean not null default true,
  government_source_verified boolean not null default false,
  suspicious_flags text[] not null default '{}',
  is_suspicious boolean not null default false,
  moderation_notes text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  apply_url text,
  application_url text,
  deadline date,
  source_type public.source_type,
  source_url text,
  expires_at timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  resume_id uuid,
  resume_url text,
  cover_letter text,
  status public.application_status not null default 'applied',
  employer_notes text,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id),
  unique (job_id, user_id)
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  file_url text,
  template_key text,
  version integer not null default 1,
  ats_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists resume_id uuid;

alter table public.applications
  drop constraint if exists applications_resume_id_fkey;

alter table public.applications
  add constraint applications_resume_id_fkey
  foreign key (resume_id) references public.resumes(id) on delete set null;

update public.companies
set is_verified = verified
where is_verified is distinct from verified;

update public.jobs
set
  apply_url = coalesce(apply_url, application_url),
  is_verified = coalesce(is_verified, false) or coalesce(government_source_verified, false),
  expires_at = coalesce(expires_at, deadline::timestamptz);

update public.applications a
set user_id = cp.user_id
from public.candidate_profiles cp
where a.candidate_id = cp.id
  and a.user_id is null;

alter table public.applications
  alter column user_id set not null;

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete cascade,
  score integer,
  job_description_text text,
  match_score integer,
  missing_keywords text[] not null default '{}',
  suggestions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  mode text not null,
  questions_json jsonb not null default '[]'::jsonb,
  answers_json jsonb not null default '[]'::jsonb,
  score integer,
  report_json jsonb not null default '{}'::jsonb,
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  phone_number text not null unique,
  city text,
  category_slug text,
  is_opted_in boolean not null default true,
  status public.subscription_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.government_jobs (
  id uuid primary key default gen_random_uuid(),
  category_slug text,
  title text not null,
  slug text not null unique,
  department text not null,
  category text not null,
  state text,
  eligibility text,
  age_limit text,
  fees text,
  last_date date,
  official_url text,
  notification_url text,
  summary text,
  official_last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  category_slug text,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  slug text not null unique,
  company text not null,
  stipend text,
  duration text,
  location text,
  work_mode public.work_mode,
  is_paid boolean not null default false,
  skills text[] not null default '{}',
  apply_url text,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords text[] not null default '{}',
  schema_type text default 'Article',
  status public.job_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  page_type text not null,
  slug text not null unique,
  title text not null,
  meta_title text,
  meta_description text,
  content text,
  faq_json jsonb not null default '[]'::jsonb,
  city text,
  state text,
  category text,
  indexable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  amount integer not null,
  plan text not null,
  subscription_type text,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  notes jsonb not null default '{}'::jsonb,
  status public.payment_status not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null default 'system',
  channel public.notification_channel not null default 'in_app',
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  candidate_id uuid references public.candidate_profiles(id) on delete set null,
  employer_id uuid references public.employer_profiles(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  session_id text,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_events_job_event_created_idx
  on public.analytics_events (job_id, event_name, created_at desc);

create index if not exists analytics_events_employer_event_created_idx
  on public.analytics_events (employer_id, event_name, created_at desc);

create index if not exists analytics_events_candidate_event_created_idx
  on public.analytics_events (candidate_id, event_name, created_at desc);

create index if not exists analytics_events_payment_event_created_idx
  on public.analytics_events (payment_id, event_name, created_at desc);

create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  reported_by uuid references public.users(id) on delete set null,
  reason text not null,
  details text,
  reviewed_by uuid references public.users(id) on delete set null,
  resolution_notes text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update public.job_reports
set user_id = coalesce(user_id, reported_by)
where user_id is null;

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  review text,
  pros text,
  cons text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.salary_data (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  job_title text not null,
  city text,
  state text,
  experience_range text,
  salary_min integer,
  salary_max integer,
  salary_type public.salary_type not null default 'yearly',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users
  add column if not exists is_banned boolean not null default false,
  add column if not exists current_plan text not null default 'free',
  add column if not exists subscription_status public.subscription_status not null default 'active',
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists last_seen_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.candidate_profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists headline text,
  add column if not exists bio text,
  add column if not exists verified boolean not null default false,
  add column if not exists verification_status public.verification_status not null default 'draft',
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.employer_profiles
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists state text,
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.jobs
  add column if not exists company_id uuid references public.companies(id) on delete set null,
  add column if not exists openings integer not null default 1,
  add column if not exists recruiter_contact text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.jobs
  add column if not exists location text;

alter table public.jobs
  add column if not exists search_vector tsvector;

update public.jobs
set
  location = trim(both ', ' from concat_ws(', ', city, state)),
  search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(skills, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(industry, '')), 'C')
where location is null or search_vector is null;

alter table public.applications
  add column if not exists created_at timestamptz not null default now();

alter table public.saved_jobs
  add column if not exists updated_at timestamptz not null default now();

alter table public.government_jobs
  add column if not exists summary text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.payments
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_signature text,
  add column if not exists notes jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists jobs_status_approval_updated_idx
  on public.jobs (status, approval_status, updated_at desc);
create index if not exists jobs_city_work_mode_idx
  on public.jobs (city, work_mode);
create index if not exists jobs_job_type_idx
  on public.jobs (job_type);
create index if not exists jobs_industry_idx
  on public.jobs (industry);
create index if not exists jobs_category_slug_idx
  on public.jobs (category_slug);
create index if not exists jobs_deadline_idx
  on public.jobs (deadline);
create index if not exists jobs_company_id_idx
  on public.jobs (company_id);
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
create index if not exists jobs_employer_id_idx
  on public.jobs (employer_id);
create index if not exists jobs_search_vector_idx
  on public.jobs using gin (search_vector);
create index if not exists applications_candidate_status_idx
  on public.applications (candidate_id, status, updated_at desc);
create index if not exists applications_job_status_idx
  on public.applications (job_id, status, updated_at desc);
create index if not exists applications_user_id_idx
  on public.applications (user_id, created_at desc);
create index if not exists saved_jobs_user_idx
  on public.saved_jobs (user_id, created_at desc);
create index if not exists job_match_scores_candidate_idx
  on public.job_match_scores (candidate_id, updated_at desc);
create index if not exists job_match_scores_job_idx
  on public.job_match_scores (job_id, updated_at desc);
create index if not exists job_reports_user_id_idx
  on public.job_reports (user_id, created_at desc);
create index if not exists resumes_user_updated_idx
  on public.resumes (user_id, updated_at desc);
create index if not exists government_jobs_category_last_date_idx
  on public.government_jobs (category, last_date desc);
create index if not exists internships_work_mode_deadline_idx
  on public.internships (work_mode, deadline);
create index if not exists company_reviews_company_status_idx
  on public.company_reviews (company_id, status, created_at desc);
create index if not exists salary_data_title_city_idx
  on public.salary_data (job_title, city);

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.employer_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.job_match_scores enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.whatsapp_subscriptions enable row level security;
alter table public.government_jobs enable row level security;
alter table public.internships enable row level security;
alter table public.blog_posts enable row level security;
alter table public.seo_pages enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.analytics_events enable row level security;
alter table public.job_reports enable row level security;
alter table public.admin_logs enable row level security;
alter table public.company_reviews enable row level security;
alter table public.salary_data enable row level security;

drop policy if exists "users can view own user row" on public.users;
create policy "users can view own user row"
on public.users for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own row" on public.users;
create policy "users update own row"
on public.users for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "admins manage all users" on public.users;
create policy "admins manage all users"
on public.users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read companies" on public.companies;
create policy "public read companies"
on public.companies for select
using (true);

drop policy if exists "employers manage linked companies" on public.companies;
create policy "employers manage linked companies"
on public.companies for all
using (
  public.is_admin() or exists (
    select 1
    from public.employer_profiles ep
    where ep.company_id = companies.id
      and ep.user_id = auth.uid()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.employer_profiles ep
    where ep.company_id = companies.id
      and ep.user_id = auth.uid()
  )
);

drop policy if exists "candidates manage own profile" on public.candidate_profiles;
create policy "candidates manage own profile"
on public.candidate_profiles for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "employers manage own profile" on public.employer_profiles;
create policy "employers manage own profile"
on public.employer_profiles for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "public read active jobs" on public.jobs;
create policy "public read active jobs"
on public.jobs for select
using (status = 'active');

drop policy if exists "admins manage all jobs" on public.jobs;
create policy "admins manage all jobs"
on public.jobs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "employers manage own jobs" on public.jobs;
create policy "employers manage own jobs"
on public.jobs for all
using (
  public.is_admin() or exists (
    select 1
    from public.employer_profiles ep
    where ep.id = jobs.employer_id
      and ep.user_id = auth.uid()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.employer_profiles ep
    where ep.id = jobs.employer_id
      and ep.user_id = auth.uid()
  )
);

drop policy if exists "candidates read own applications" on public.applications;
create policy "candidates read own applications"
on public.applications for select
using (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = applications.candidate_id
      and cp.user_id = auth.uid()
  ) or exists (
    select 1
    from public.jobs j
    join public.employer_profiles ep on ep.id = j.employer_id
    where j.id = applications.job_id
      and ep.user_id = auth.uid()
  )
);

drop policy if exists "candidates create own applications" on public.applications;
create policy "candidates create own applications"
on public.applications for insert
with check (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = applications.candidate_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "candidates update own applications" on public.applications;
create policy "candidates update own applications"
on public.applications for update
using (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = applications.candidate_id
      and cp.user_id = auth.uid()
  ) or exists (
    select 1
    from public.jobs j
    join public.employer_profiles ep on ep.id = j.employer_id
    where j.id = applications.job_id
      and ep.user_id = auth.uid()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = applications.candidate_id
      and cp.user_id = auth.uid()
  ) or exists (
    select 1
    from public.jobs j
    join public.employer_profiles ep on ep.id = j.employer_id
    where j.id = applications.job_id
      and ep.user_id = auth.uid()
  )
);

drop policy if exists "users manage own saved jobs" on public.saved_jobs;
create policy "users manage own saved jobs"
on public.saved_jobs for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own job match scores" on public.job_match_scores;
create policy "users manage own job match scores"
on public.job_match_scores for all
using (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = job_match_scores.candidate_id
      and cp.user_id = auth.uid()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.candidate_profiles cp
    where cp.id = job_match_scores.candidate_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "users manage own applications" on public.applications;
create policy "users manage own applications"
on public.applications for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own resumes" on public.resumes;
create policy "users manage own resumes"
on public.resumes for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own analyses" on public.resume_analyses;
create policy "users manage own analyses"
on public.resume_analyses for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own interview sessions" on public.interview_sessions;
create policy "users manage own interview sessions"
on public.interview_sessions for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "users manage own whatsapp subscriptions" on public.whatsapp_subscriptions;
create policy "users manage own whatsapp subscriptions"
on public.whatsapp_subscriptions for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "public read government jobs" on public.government_jobs;
create policy "public read government jobs"
on public.government_jobs for select
using (true);

drop policy if exists "admins manage government jobs" on public.government_jobs;
create policy "admins manage government jobs"
on public.government_jobs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read internships" on public.internships;
create policy "public read internships"
on public.internships for select
using (true);

drop policy if exists "admins manage internships" on public.internships;
create policy "admins manage internships"
on public.internships for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published blog posts" on public.blog_posts;
create policy "public read published blog posts"
on public.blog_posts for select
using (status = 'active' or public.is_admin());

drop policy if exists "admins manage blog posts" on public.blog_posts;
create policy "admins manage blog posts"
on public.blog_posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read indexable seo pages" on public.seo_pages;
create policy "public read indexable seo pages"
on public.seo_pages for select
using (indexable = true or public.is_admin());

drop policy if exists "admins manage seo pages" on public.seo_pages;
create policy "admins manage seo pages"
on public.seo_pages for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users read own payments" on public.payments;
create policy "users read own payments"
on public.payments for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins manage payments" on public.payments;
create policy "admins manage payments"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
on public.notifications for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins manage notifications" on public.notifications;
create policy "admins manage notifications"
on public.notifications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage analytics events" on public.analytics_events;
create policy "admins manage analytics events"
on public.analytics_events for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users create analytics events" on public.analytics_events;
create policy "users create analytics events"
on public.analytics_events for insert
with check (true);

drop policy if exists "users create job reports" on public.job_reports;
create policy "users create job reports"
on public.job_reports for insert
with check (true);

drop policy if exists "users manage own job reports" on public.job_reports;
create policy "users manage own job reports"
on public.job_reports for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins manage job reports" on public.job_reports;
create policy "admins manage job reports"
on public.job_reports for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage admin logs" on public.admin_logs;
create policy "admins manage admin logs"
on public.admin_logs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published company reviews" on public.company_reviews;
create policy "public read published company reviews"
on public.company_reviews for select
using (status = 'published' or public.is_admin());

drop policy if exists "users create company reviews" on public.company_reviews;
create policy "users create company reviews"
on public.company_reviews for insert
with check (auth.uid() = user_id or auth.uid() is not null or public.is_admin());

drop policy if exists "users update own company reviews" on public.company_reviews;
create policy "users update own company reviews"
on public.company_reviews for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "public read salary data" on public.salary_data;
create policy "public read salary data"
on public.salary_data for select
using (true);

drop policy if exists "admins manage salary data" on public.salary_data;
create policy "admins manage salary data"
on public.salary_data for all
using (public.is_admin())
with check (public.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users',
    'companies',
    'candidate_profiles',
    'employer_profiles',
    'jobs',
    'applications',
    'saved_jobs',
    'resumes',
    'resume_analyses',
    'interview_sessions',
    'whatsapp_subscriptions',
    'government_jobs',
    'internships',
    'blog_posts',
    'seo_pages',
    'payments',
    'notifications',
    'analytics_events',
    'job_reports',
    'admin_logs',
    'company_reviews',
    'salary_data'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.sync_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, phone, raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute function private.sync_auth_user();

grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.companies,
  public.jobs,
  public.government_jobs,
  public.internships,
  public.blog_posts,
  public.seo_pages,
  public.salary_data,
  public.company_reviews
to anon;

grant insert on
  public.analytics_events,
  public.job_reports
to anon;

grant select, insert, update, delete on
  public.users,
  public.companies,
  public.candidate_profiles,
  public.employer_profiles,
  public.jobs,
  public.applications,
  public.saved_jobs,
  public.job_match_scores,
  public.resumes,
  public.resume_analyses,
  public.interview_sessions,
  public.whatsapp_subscriptions,
  public.government_jobs,
  public.internships,
  public.blog_posts,
  public.seo_pages,
  public.payments,
  public.notifications,
  public.analytics_events,
  public.job_reports,
  public.admin_logs,
  public.company_reviews,
  public.salary_data
to authenticated;

grant all privileges on all tables in schema public to service_role;

notify pgrst, 'reload schema';
