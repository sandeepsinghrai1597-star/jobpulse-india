create table if not exists public.job_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  job_family text not null check (job_family in ('private', 'government', 'internship')),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_categories_job_family_sort_idx
  on public.job_categories (job_family, sort_order, name);

alter table public.jobs
  add column if not exists category_slug text;

alter table public.government_jobs
  add column if not exists category_slug text;

alter table public.internships
  add column if not exists category_slug text;

insert into public.job_categories (slug, name, job_family, description, sort_order)
values
  ('software-it', 'Software & IT', 'private', 'Software development, support, QA, DevOps, and IT operations roles.', 10),
  ('data-analytics', 'Data & Analytics', 'private', 'Data analyst, BI, reporting, operations analytics, and MIS roles.', 20),
  ('sales-business-development', 'Sales & Business Development', 'private', 'Field sales, inside sales, business development, and account growth roles.', 30),
  ('banking-finance', 'Banking & Finance', 'private', 'Private banking, finance operations, accounting, and BFSI jobs.', 40),
  ('customer-support-bpo', 'Customer Support & BPO', 'private', 'Customer success, support, call center, and process roles.', 50),
  ('hr-recruitment', 'HR & Recruitment', 'private', 'Talent acquisition, HR operations, payroll, and recruiter roles.', 60),
  ('marketing-digital', 'Marketing & Digital', 'private', 'Digital marketing, performance marketing, brand, social, and growth roles.', 70),
  ('content-marketing', 'Content & Media', 'private', 'Content writing, editorial, SEO, communications, and media roles.', 80),
  ('healthcare-pharma', 'Healthcare & Pharma', 'private', 'Clinical, non-clinical, diagnostics, hospital, and pharma roles.', 90),
  ('education-training', 'Education & Training', 'private', 'Teaching, training, curriculum, and edtech roles.', 100),
  ('operations-logistics', 'Operations & Logistics', 'private', 'Back-office operations, supply chain, warehouse, and logistics roles.', 110),
  ('remote-work-from-home', 'Remote / Work From Home', 'private', 'Remote-first jobs across functions.', 120),
  ('fresher-entry-level', 'Fresher / Entry Level', 'private', 'Beginner-friendly jobs for freshers and early-career candidates.', 130),
  ('ssc', 'SSC Jobs', 'government', 'Staff Selection Commission and related central recruitment.', 210),
  ('banking', 'Banking Government Jobs', 'government', 'IBPS, SBI, RBI, NABARD, and public-sector banking recruitment.', 220),
  ('railway', 'Railway Jobs', 'government', 'Railway recruitment boards and related vacancies.', 230),
  ('defence', 'Defence Jobs', 'government', 'Army, Navy, Air Force, and defence civilian roles.', 240),
  ('teaching', 'Teaching Government Jobs', 'government', 'School, college, university, and education board recruitment.', 250),
  ('state-psc', 'State PSC Jobs', 'government', 'State public service commission vacancies.', 260),
  ('software-it-internships', 'Software & IT Internships', 'internship', 'Engineering, frontend, backend, QA, and tech internships.', 310),
  ('marketing-internships', 'Marketing Internships', 'internship', 'Digital, brand, social, and growth internships.', 320),
  ('data-analytics-internships', 'Data & Analytics Internships', 'internship', 'Analytics, BI, and data-focused internships.', 330),
  ('design-internships', 'Design Internships', 'internship', 'UI, UX, graphics, and product design internships.', 340),
  ('business-operations-internships', 'Business & Operations Internships', 'internship', 'Operations, sales, HR, and business support internships.', 350)
on conflict (slug) do update
set
  name = excluded.name,
  job_family = excluded.job_family,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

update public.jobs
set category_slug = case
  when slug = 'junior-data-analyst-delhi' then 'data-analytics'
  when slug = 'software-support-engineer-noida' then 'software-it'
  when slug = 'sales-executive-gurgaon' then 'sales-business-development'
  when slug = 'remote-content-writer-india' then 'content-marketing'
  when source_type = 'official' then 'fresher-entry-level'
  else coalesce(category_slug, 'fresher-entry-level')
end
where category_slug is null;

update public.government_jobs
set category_slug = case
  when category in ('ssc', 'ssc-cgl', 'ssc-chsl') then 'ssc'
  when category in ('banking', 'ibps', 'sbi', 'rbi') then 'banking'
  when category in ('railway', 'rrb') then 'railway'
  when category in ('defence', 'army', 'navy', 'airforce') then 'defence'
  when category in ('teaching', 'education') then 'teaching'
  when category in ('psc', 'state-psc', 'uppsc', 'bpsc', 'mppsc') then 'state-psc'
  else coalesce(category_slug, lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')))
end
where category_slug is null;

update public.internships
set category_slug = case
  when lower(title) like '%marketing%' then 'marketing-internships'
  when lower(title) like '%frontend%' or lower(title) like '%developer%' or lower(title) like '%software%' then 'software-it-internships'
  when lower(title) like '%data%' or lower(title) like '%analyst%' then 'data-analytics-internships'
  when lower(title) like '%design%' then 'design-internships'
  else coalesce(category_slug, 'business-operations-internships')
end
where category_slug is null;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'jobs'
      and constraint_name = 'jobs_category_slug_fkey'
  ) then
    alter table public.jobs
      add constraint jobs_category_slug_fkey
      foreign key (category_slug) references public.job_categories(slug);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'government_jobs'
      and constraint_name = 'government_jobs_category_slug_fkey'
  ) then
    alter table public.government_jobs
      add constraint government_jobs_category_slug_fkey
      foreign key (category_slug) references public.job_categories(slug);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'internships'
      and constraint_name = 'internships_category_slug_fkey'
  ) then
    alter table public.internships
      add constraint internships_category_slug_fkey
      foreign key (category_slug) references public.job_categories(slug);
  end if;
end
$$;

create index if not exists jobs_category_slug_idx
  on public.jobs (category_slug);

create index if not exists government_jobs_category_slug_idx
  on public.government_jobs (category_slug);

create index if not exists internships_category_slug_idx
  on public.internships (category_slug);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'public_job_categories_set_updated_at'
  ) then
    create trigger public_job_categories_set_updated_at
    before update on public.job_categories
    for each row execute function public.set_updated_at();
  end if;
end
$$;
