alter table public.employer_profiles
  add column if not exists recruiter_name text,
  add column if not exists recruiter_phone text;
