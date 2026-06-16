alter table public.candidate_profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists headline text,
  add column if not exists bio text,
  add column if not exists verified boolean not null default false,
  add column if not exists verification_status text not null default 'draft',
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verified_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'candidate_profiles_verification_status_check'
  ) then
    alter table public.candidate_profiles
      add constraint candidate_profiles_verification_status_check
      check (verification_status in ('draft', 'pending', 'verified', 'rejected'));
  end if;
end
$$;

create index if not exists candidate_profiles_verification_status_idx
  on public.candidate_profiles (verification_status, verified);
