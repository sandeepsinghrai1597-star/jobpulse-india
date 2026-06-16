alter table public.internships
  add column if not exists company_id uuid references public.companies(id) on delete set null;

insert into public.companies (
  name,
  slug,
  website,
  industry,
  city,
  state,
  description,
  verified
) values
  (
    'Insight Ladder',
    'insight-ladder',
    'https://insightladder.in',
    'Analytics',
    'Delhi',
    'Delhi',
    'Analytics hiring platform for Indian SMB reporting teams.',
    true
  ),
  (
    'CloudPulse Systems',
    'cloudpulse-systems',
    'https://cloudpulse.in',
    'SaaS',
    'Noida',
    'Uttar Pradesh',
    'Customer support and product operations SaaS company.',
    true
  ),
  (
    'GrowthMint',
    'growthmint',
    'https://growthmint.in',
    'Marketing',
    'Bengaluru',
    'Karnataka',
    'Performance marketing and content growth agency.',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  website = excluded.website,
  industry = excluded.industry,
  city = excluded.city,
  state = excluded.state,
  description = excluded.description,
  verified = excluded.verified,
  updated_at = now();

with company_refs as (
  select slug, id
  from public.companies
  where slug in ('insight-ladder', 'cloudpulse-systems', 'growthmint')
)
insert into public.jobs (
  company_id,
  category_slug,
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
  industry,
  openings,
  recruiter_contact,
  status,
  approval_status,
  application_url,
  source_type,
  source_url,
  deadline,
  search_vector
) values
  (
    (select id from company_refs where slug = 'insight-ladder'),
    'it-jobs',
    'Junior Data Analyst',
    'junior-data-analyst-delhi',
    'Insight Ladder',
    'Work with Excel, SQL, and Power BI to support business reporting for Indian SMBs.',
    array['Build weekly dashboards', 'Clean CRM data', 'Translate insights into reporting'],
    array['Graduate degree', 'Basic SQL', 'Excel proficiency'],
    array['Excel', 'SQL', 'Power BI', 'Communication'],
    350000,
    550000,
    'yearly',
    'Delhi',
    'Delhi',
    'India',
    'Delhi, Delhi',
    'full-time',
    'hybrid',
    'BCA / BSc / Graduate',
    '0-2 years',
    'Analytics',
    3,
    'careers@insightladder.in',
    'active',
    'approved',
    'https://example.com/jobs/junior-data-analyst-delhi',
    'partner',
    'https://example.com/jobs/junior-data-analyst-delhi',
    '2026-07-10',
    setweight(to_tsvector('english', 'Junior Data Analyst'), 'A') ||
    setweight(to_tsvector('english', 'Insight Ladder'), 'A') ||
    setweight(to_tsvector('english', 'Work with Excel, SQL, and Power BI to support business reporting for Indian SMBs.'), 'B') ||
    setweight(to_tsvector('english', 'Excel SQL Power BI Communication'), 'B') ||
    setweight(to_tsvector('english', 'Delhi'), 'C') ||
    setweight(to_tsvector('english', 'Analytics'), 'C')
  ),
  (
    (select id from company_refs where slug = 'cloudpulse-systems'),
    'it-jobs',
    'Software Support Engineer',
    'software-support-engineer-noida',
    'CloudPulse Systems',
    'Support SaaS customers, troubleshoot product issues, and collaborate with engineering teams.',
    array['Respond to support tickets', 'Document recurring issues', 'Coordinate bug reports'],
    array['Basic programming knowledge', 'Customer empathy', 'Shift readiness'],
    array['JavaScript', 'Python', 'Customer Support', 'Troubleshooting'],
    300000,
    500000,
    'yearly',
    'Noida',
    'Uttar Pradesh',
    'India',
    'Noida, Uttar Pradesh',
    'full-time',
    'onsite',
    'BTech / BCA / MCA',
    '0-1 years',
    'SaaS',
    6,
    'jobs@cloudpulse.in',
    'active',
    'approved',
    'https://example.com/jobs/software-support-engineer-noida',
    'employer',
    'https://example.com/jobs/software-support-engineer-noida',
    '2026-06-28',
    setweight(to_tsvector('english', 'Software Support Engineer'), 'A') ||
    setweight(to_tsvector('english', 'CloudPulse Systems'), 'A') ||
    setweight(to_tsvector('english', 'Support SaaS customers, troubleshoot product issues, and collaborate with engineering teams.'), 'B') ||
    setweight(to_tsvector('english', 'JavaScript Python Customer Support Troubleshooting'), 'B') ||
    setweight(to_tsvector('english', 'Noida'), 'C') ||
    setweight(to_tsvector('english', 'SaaS'), 'C')
  ),
  (
    (select id from company_refs where slug = 'growthmint'),
    'internship-jobs',
    'Digital Marketing Intern',
    'digital-marketing-intern-bangalore',
    'GrowthMint',
    'Support campaign execution, content planning, and reporting for fast-growing brands.',
    array['Support content calendars', 'Track campaign metrics', 'Assist research and briefs'],
    array['Good writing skills', 'Basic digital marketing understanding'],
    array['Meta Ads', 'Canva', 'Copywriting'],
    15000,
    18000,
    'stipend',
    'Bengaluru',
    'Karnataka',
    'India',
    'Bengaluru, Karnataka',
    'internship',
    'hybrid',
    'Graduate / Undergraduate',
    'Fresher',
    'Marketing',
    2,
    'internships@growthmint.in',
    'active',
    'approved',
    'https://example.com/internships/digital-marketing-intern-bangalore',
    'partner',
    'https://example.com/internships/digital-marketing-intern-bangalore',
    '2026-07-01',
    setweight(to_tsvector('english', 'Digital Marketing Intern'), 'A') ||
    setweight(to_tsvector('english', 'GrowthMint'), 'A') ||
    setweight(to_tsvector('english', 'Support campaign execution, content planning, and reporting for fast-growing brands.'), 'B') ||
    setweight(to_tsvector('english', 'Meta Ads Canva Copywriting'), 'B') ||
    setweight(to_tsvector('english', 'Bengaluru'), 'C') ||
    setweight(to_tsvector('english', 'Marketing'), 'C')
  )
on conflict (slug) do update set
  company_id = excluded.company_id,
  category_slug = excluded.category_slug,
  title = excluded.title,
  company_name = excluded.company_name,
  description = excluded.description,
  responsibilities = excluded.responsibilities,
  requirements = excluded.requirements,
  skills = excluded.skills,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  salary_type = excluded.salary_type,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  location = excluded.location,
  job_type = excluded.job_type,
  work_mode = excluded.work_mode,
  education_required = excluded.education_required,
  experience_required = excluded.experience_required,
  industry = excluded.industry,
  openings = excluded.openings,
  recruiter_contact = excluded.recruiter_contact,
  status = excluded.status,
  approval_status = excluded.approval_status,
  application_url = excluded.application_url,
  source_type = excluded.source_type,
  source_url = excluded.source_url,
  deadline = excluded.deadline,
  search_vector = excluded.search_vector,
  updated_at = now();

insert into public.government_jobs (
  category_slug,
  title,
  slug,
  department,
  category,
  state,
  eligibility,
  age_limit,
  fees,
  last_date,
  official_url,
  notification_url,
  summary
) values
  (
    'government-jobs',
    'SSC CGL 2026',
    'ssc-cgl-2026',
    'Staff Selection Commission',
    'ssc',
    'All India',
    'Bachelor''s degree',
    '18-32 years',
    'INR 100',
    '2026-07-15',
    'https://ssc.gov.in',
    'https://ssc.gov.in/notification/cgl-2026',
    'Combined Graduate Level recruitment for central government departments.'
  ),
  (
    'banking-jobs',
    'IBPS PO 2026',
    'ibps-po-2026',
    'IBPS',
    'banking',
    'All India',
    'Graduate',
    '20-30 years',
    'INR 850',
    '2026-08-02',
    'https://www.ibps.in',
    'https://www.ibps.in/ibps-po-2026',
    'Probationary officer recruitment across public sector banks.'
  )
on conflict (slug) do update set
  category_slug = excluded.category_slug,
  title = excluded.title,
  department = excluded.department,
  category = excluded.category,
  state = excluded.state,
  eligibility = excluded.eligibility,
  age_limit = excluded.age_limit,
  fees = excluded.fees,
  last_date = excluded.last_date,
  official_url = excluded.official_url,
  notification_url = excluded.notification_url,
  summary = excluded.summary,
  updated_at = now();

with company_refs as (
  select slug, id
  from public.companies
  where slug in ('growthmint', 'cloudpulse-systems')
)
insert into public.internships (
  category_slug,
  company_id,
  title,
  slug,
  company,
  stipend,
  duration,
  location,
  work_mode,
  is_paid,
  skills,
  apply_url,
  deadline
) values
  (
    'internship-jobs',
    (select id from company_refs where slug = 'growthmint'),
    'Digital Marketing Intern',
    'marketing-intern-bangalore',
    'GrowthMint',
    'INR 15,000/month',
    '3 months',
    'Bengaluru',
    'hybrid',
    true,
    array['Meta Ads', 'Canva', 'Copywriting'],
    'https://example.com/internships/marketing-intern-bangalore',
    '2026-06-25'
  ),
  (
    'internship-jobs',
    (select id from company_refs where slug = 'cloudpulse-systems'),
    'Frontend Developer Intern',
    'frontend-intern-remote',
    'CloudPulse Systems',
    'INR 18,000/month',
    '6 months',
    'Remote',
    'remote',
    true,
    array['React', 'TypeScript', 'Tailwind CSS'],
    'https://example.com/internships/frontend-intern-remote',
    '2026-07-01'
  )
on conflict (slug) do update set
  category_slug = excluded.category_slug,
  company_id = excluded.company_id,
  title = excluded.title,
  company = excluded.company,
  stipend = excluded.stipend,
  duration = excluded.duration,
  location = excluded.location,
  work_mode = excluded.work_mode,
  is_paid = excluded.is_paid,
  skills = excluded.skills,
  apply_url = excluded.apply_url,
  deadline = excluded.deadline,
  updated_at = now();

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  meta_title,
  meta_description,
  keywords,
  status,
  published_at
) values
  (
    'Best Jobs After BCA in India',
    'best-jobs-after-bca',
    'Top BCA roles, fresher salary ranges, and skills that improve interview chances.',
    'BCA graduates can target support engineering, QA, data analyst, web development, and SaaS operations roles. Focus on SQL, Excel, communication, and one core programming language.',
    'Best Jobs After BCA in India 2026',
    'Explore the best jobs after BCA, salary ranges, and skill roadmap for freshers in India.',
    array['jobs after BCA', 'BCA fresher jobs', 'career after BCA'],
    'active',
    '2026-06-01T00:00:00Z'
  ),
  (
    'How to Make an ATS-Friendly Resume',
    'how-to-make-ats-resume',
    'Learn how to structure your resume for ATS scanners and recruiter shortlisting.',
    'Use clear headings, quantify achievements, match role-specific keywords, and avoid heavy graphics in ATS-first resume formats.',
    'How to Make an ATS Resume That Gets Shortlisted',
    'Build an ATS-friendly resume with better formatting, keywords, and structure for recruiters.',
    array['ATS resume', 'resume tips', 'resume keywords'],
    'active',
    '2026-05-28T00:00:00Z'
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  keywords = excluded.keywords,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();
