create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('candidate', 'employer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  education text,
  skills text[] default '{}',
  experience text,
  city text,
  state text,
  preferred_roles text[] default '{}',
  expected_salary integer,
  preferred_job_types text[] default '{}',
  language_preference text default 'en',
  resume_url text
);

create table if not exists employer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  company_name text not null,
  logo_url text,
  website text,
  industry text,
  city text,
  verified boolean not null default false,
  approval_status text not null default 'pending'
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references employer_profiles(id) on delete set null,
  title text not null,
  slug text unique not null,
  company_name text not null,
  description text not null,
  responsibilities text[] default '{}',
  requirements text[] default '{}',
  skills text[] default '{}',
  salary_min integer,
  salary_max integer,
  salary_type text default 'yearly',
  city text,
  state text,
  country text default 'India',
  job_type text,
  work_mode text,
  education_required text,
  experience_required text,
  industry text,
  status text not null default 'draft',
  approval_status text not null default 'pending',
  is_featured boolean not null default false,
  application_url text,
  deadline date,
  source_type text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  resume_url text,
  cover_letter text,
  status text not null default 'applied',
  employer_notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  file_url text,
  template_key text,
  version integer not null default 1,
  ats_score integer,
  created_at timestamptz not null default now()
);

create table if not exists resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  resume_id uuid references resumes(id) on delete cascade,
  score integer,
  job_description_text text,
  match_score integer,
  missing_keywords text[] default '{}',
  suggestions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role text not null,
  mode text not null,
  questions_json jsonb not null default '[]'::jsonb,
  answers_json jsonb not null default '[]'::jsonb,
  score integer,
  report_json jsonb not null default '{}'::jsonb,
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists government_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  department text not null,
  category text not null,
  state text,
  eligibility text,
  age_limit text,
  fees text,
  last_date date,
  official_url text,
  notification_url text,
  official_last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  company text not null,
  stipend text,
  duration text,
  location text,
  work_mode text,
  is_paid boolean not null default false,
  skills text[] default '{}',
  apply_url text,
  deadline date
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords text[] default '{}',
  schema_type text default 'Article',
  status text not null default 'draft',
  published_at timestamptz
);

create table if not exists seo_pages (
  id uuid primary key default gen_random_uuid(),
  page_type text not null,
  slug text unique not null,
  title text not null,
  meta_title text,
  meta_description text,
  content text,
  faq_json jsonb not null default '[]'::jsonb,
  city text,
  state text,
  category text,
  indexable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  amount integer not null,
  plan text not null,
  subscription_type text,
  razorpay_payment_id text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  session_id text,
  event_name text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table candidate_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;
alter table resumes enable row level security;
alter table resume_analyses enable row level security;
alter table interview_sessions enable row level security;

create policy "users can view own user row"
on users for select
using (auth.uid() = id);

create policy "candidates manage own profile"
on candidate_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "employers manage own profile"
on employer_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "public read active jobs"
on jobs for select
using (status = 'active');

create policy "users manage own saved jobs"
on saved_jobs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own resumes"
on resumes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own analyses"
on resume_analyses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own interview sessions"
on interview_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
