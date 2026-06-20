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
