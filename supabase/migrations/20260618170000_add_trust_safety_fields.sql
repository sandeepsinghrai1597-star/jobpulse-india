alter table public.employer_profiles
  add column if not exists company_email text,
  add column if not exists company_email_verified boolean not null default false,
  add column if not exists domain_verification_status text not null default 'pending';

alter table public.jobs
  add column if not exists no_candidate_payment boolean not null default true,
  add column if not exists salary_disclosed boolean not null default true,
  add column if not exists government_source_verified boolean not null default false,
  add column if not exists suspicious_flags text[] not null default '{}',
  add column if not exists is_suspicious boolean not null default false,
  add column if not exists moderation_notes text;

alter table public.job_reports
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists resolution_notes text;
