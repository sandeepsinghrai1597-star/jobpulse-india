create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_skill_links (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (job_id, skill_id)
);

alter table public.jobs
  add column if not exists published_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists import_source text,
  add column if not exists import_batch_id uuid;

create index if not exists jobs_source_status_created_idx
  on public.jobs (source_type, approval_status, status, created_at desc);

create index if not exists jobs_published_at_idx
  on public.jobs (published_at desc nulls last);

create index if not exists skills_slug_idx
  on public.skills (slug);

create index if not exists job_skill_links_job_id_idx
  on public.job_skill_links (job_id);

create index if not exists job_skill_links_skill_id_idx
  on public.job_skill_links (skill_id);

alter table public.job_categories enable row level security;
alter table public.skills enable row level security;
alter table public.job_skill_links enable row level security;

drop policy if exists "public read active job categories" on public.job_categories;
create policy "public read active job categories"
on public.job_categories for select
using (is_active = true or public.is_admin());

drop policy if exists "admins manage job categories" on public.job_categories;
create policy "admins manage job categories"
on public.job_categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read skills" on public.skills;
create policy "public read skills"
on public.skills for select
using (true);

drop policy if exists "admins manage skills" on public.skills;
create policy "admins manage skills"
on public.skills for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read job skill links" on public.job_skill_links;
create policy "public read job skill links"
on public.job_skill_links for select
using (true);

drop policy if exists "admins manage job skill links" on public.job_skill_links;
create policy "admins manage job skill links"
on public.job_skill_links for all
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists public_skills_set_updated_at on public.skills;
create trigger public_skills_set_updated_at
before update on public.skills
for each row execute function public.set_updated_at();
