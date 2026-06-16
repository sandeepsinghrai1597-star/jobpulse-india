insert into public.job_categories (slug, name, job_family, description, sort_order)
values
  ('it-jobs', 'IT Jobs', 'private', 'Software, support, analytics, tech, and digital product roles.', 10),
  ('sales-jobs', 'Sales Jobs', 'private', 'Sales, business development, and revenue-focused roles.', 20),
  ('banking-jobs', 'Banking Jobs', 'private', 'Banking, BFSI, lending, and finance operations roles.', 30),
  ('healthcare-jobs', 'Healthcare Jobs', 'private', 'Hospital, clinic, diagnostics, and healthcare support roles.', 40),
  ('government-jobs', 'Government Jobs', 'government', 'Public sector and government recruitment opportunities.', 50),
  ('work-from-home-jobs', 'Work From Home Jobs', 'private', 'Remote-first and home-based opportunities.', 60),
  ('fresher-jobs', 'Fresher Jobs', 'private', 'Entry-level roles suitable for freshers and early-career candidates.', 70),
  ('internship-jobs', 'Internship Jobs', 'internship', 'Paid and unpaid internship opportunities.', 80)
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
  when lower(coalesce(job_type, '')) = 'internship' then 'internship-jobs'
  when lower(coalesce(work_mode, '')) = 'remote'
    or lower(title || ' ' || description) ~ '(remote|work from home|wfh|online)' then 'work-from-home-jobs'
  when lower(title || ' ' || description || ' ' || coalesce(industry, '')) ~ '(bank|banking|ibps|sbi|rbi|finance|loan|credit)' then 'banking-jobs'
  when lower(title || ' ' || description || ' ' || coalesce(industry, '')) ~ '(hospital|health|healthcare|clinic|pharma|medical|nurse)' then 'healthcare-jobs'
  when lower(title || ' ' || description || ' ' || coalesce(industry, '')) ~ '(government|govt|ssc|railway|rrb|defence|army|navy|air force|psc)' then 'government-jobs'
  when lower(title || ' ' || description || ' ' || coalesce(industry, '')) ~ '(sales|business development|lead generation|crm|field sales|inside sales)' then 'sales-jobs'
  when lower(title || ' ' || description || ' ' || coalesce(industry, '') || ' ' || coalesce(education_required, '') || ' ' || coalesce(experience_required, '')) ~ '(software|developer|frontend|backend|full stack|qa|support engineer|it|tech|data|analyst|sql|python|javascript|react|power bi)' then 'it-jobs'
  when lower(coalesce(source_type, '')) = 'official'
    or lower(title || ' ' || description || ' ' || coalesce(education_required, '') || ' ' || coalesce(experience_required, '')) ~ '(fresher|entry level|graduate|0-1 years|0-2 years)' then 'fresher-jobs'
  else 'fresher-jobs'
end;

update public.government_jobs
set category_slug = case
  when lower(coalesce(category, '')) ~ '(banking|ibps|sbi|rbi)' then 'banking-jobs'
  else 'government-jobs'
end;

update public.internships
set category_slug = 'internship-jobs';

update public.job_categories
set is_active = slug in (
  'it-jobs',
  'sales-jobs',
  'banking-jobs',
  'healthcare-jobs',
  'government-jobs',
  'work-from-home-jobs',
  'fresher-jobs',
  'internship-jobs'
);
