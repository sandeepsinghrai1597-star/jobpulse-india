# JobPulse India Production Audit

Audit date: 2026-06-27  
Production URL: https://jobpulse-india.vercel.app/  
Codebase audited: `C:/Users/Amrit/Desktop/New folder/jobpulse-india`

## Executive Summary

JobPulse India is no longer a simple job-board prototype. The production app has a broad Next.js 16 App Router surface, public SEO pages, AI tools, candidate/employer/admin dashboards, Razorpay payments, Supabase auth/data/storage, job ingestion, government jobs, internships, and a meaningful test suite. The platform is directionally strong, but it is not yet at "India's most trusted AI Job Platform" quality because trust, abuse protection, SEO hygiene, role-based e2e reliability, and conversion clarity still need hardening.

The most important production finding is that the site is live and buildable, but a non-existent URL such as `/this-route-should-not-exist` returns `200` through the catch-all SEO route. That can create index bloat and soft-404 risk. The second major issue is operational: `npm run lint` fails because ESLint scans `tmp/generate-jobpulse-sql.cjs`. Unit tests pass, build passes, TypeScript passes, but e2e is blocked by database user setup.

## Scores

| Area | Score | Reason |
|---|---:|---|
| Overall Production Readiness | 78/100 | Build passes and product surface is broad, but e2e, rate limiting, soft-404s, and trust flows are incomplete. |
| Security | 82/100 | Next/React versions are patched, headers and webhook signatures exist, RLS is broad, but AI/API rate limits and cron/webhook protections need tightening. |
| SEO | 76/100 | Sitemap, robots, metadata, JobPosting schema, and programmatic pages exist; soft-404s, repeated titles, missing H1s, and SVG OG image reduce quality. |
| Performance | 80/100 | Static/ISR coverage is good; `/api/jobs/search` returns about 309 KB unpaginated and some dynamic pages need stricter caching. |
| UX | 74/100 | Core journeys exist, but several pages are tool pages without enough guided onboarding, trust proof, and empty/error state polish. |
| Accessibility | 72/100 | Labels and focus classes exist in key forms; missing H1s, color contrast risks, and custom selects need review. |
| Code Quality | 79/100 | Good App Router structure and tests, but generated files break lint and several large modules should be split. |
| Database | 80/100 | RLS, indexes, enums, and constraints exist; public insert policies and role derivation should be tightened. |
| Growth | 75/100 | Strong programmatic SEO base, but content quality, city/category taxonomy, trust assets, and conversion loops need expansion. |
| AI | 68/100 | Multiple AI tools exist; rate limiting, cost controls, prompt telemetry, and hallucination guardrails are incomplete. |

## Verified Evidence

- Production crawl reached home, jobs, learning roadmap, resume builder, resume analyzer, interview prep, pricing, login, signup, AI career agent, remote jobs, fresher jobs, government jobs, internships, blog, career guides, and many government job detail pages.
- `npm run build` completed successfully and generated 458 routes.
- `npx tsc --noEmit` passed.
- `npm run test` passed: 8 test suites, 21 tests.
- `npm run lint` failed because `tmp/generate-jobpulse-sql.cjs` uses `require()`, and scripts contain unused variables.
- `npm run test:e2e` failed during `e2e/global.setup.ts` because `scripts/setup-e2e.mjs` could not create a database user.
- `/api/jobs/search` returned HTTP 200 with about 309 KB JSON.
- `/api/og` returned `image/svg+xml`, while metadata advertises it as the main OG/Twitter image.
- `/this-route-should-not-exist` returned HTTP 200, indicating a soft-404/indexation risk.

## Top 20 Critical Bugs

1. Soft-404: unknown routes return 200 through `src/app/[slug]/page.tsx`; return `notFound()` when no SEO page exists.
2. Lint failure: exclude or clean `tmp/generate-jobpulse-sql.cjs`; update `eslint.config.mjs`.
3. E2E blocked: `e2e/global.setup.ts` fails because `scripts/setup-e2e.mjs` cannot create a database user.
4. AI rate limiter is a placeholder in `src/app/api/ai/career-agent/route.ts`.
5. Anonymous resume analysis can trigger AI cost in `src/app/api/ai/resume-analyze/route.ts`.
6. `/api/jobs/search` returns a very large payload; enforce pagination and max page size.
7. Important pages lack a visible H1: `src/app/(marketing)/government-jobs/page.tsx`, `src/app/(marketing)/internships/page.tsx`, `src/app/(marketing)/learning-roadmap/page.tsx`.
8. OG endpoint returns SVG, which is less reliable for social previews than PNG/JPEG.
9. `robots.ts` disallows `/api`, but `/api/sitemap` still exists; remove or protect duplicate sitemap JSON.
10. Public analytics insert policy allows anonymous arbitrary event inserts in `supabase/schema.sql`.
11. Public job report insert policy allows anonymous inserts without rate limiting in `supabase/schema.sql`.
12. Proxy authorization is helpful but must not be the only guard for admin/employer routes after CVE-2025-29927 style bypasses.
13. Role fallback still reads `user_metadata` in `src/lib/supabase/proxy.ts`; only `app_metadata` or DB role should authorize.
14. Cron routes under `src/app/api/cron/*` need explicit secret validation on every entrypoint.
15. WhatsApp webhook route needs signature verification and replay protection.
16. `src/lib/jobs/live.ts` has large mixed responsibilities: external fetching, fallback conversion, persistence, search data loading.
17. Government job title templates repeat "2026" on several production pages.
18. Homepage company marquee uses recognizable company names without evidence of actual partnerships.
19. Candidate trust claims need stronger source labels and verification timestamps on every job detail page.
20. No production monitoring contract is visible for AI costs, API error rates, job ingestion failures, or search latency.

## Product Audit

Score: 78/100.

Strengths: clear "AI Career Companion" direction, multiple tools, candidate/employer/admin surfaces, government jobs, internships, pricing, dashboard, resume upload, and verified apply workflow.

Gaps: positioning is still broad. The homepage says "Search jobs and get AI career support," but the trust wedge should be sharper: "verified Indian jobs plus AI tools that help you apply safely." The product should lead with scam protection, verified sources, no candidate fee, official links, application tracking, and AI guidance.

Implementation:

- Update `src/components/marketing/hero-section.tsx` hero copy to focus on trusted verified jobs and application outcomes.
- Add trust metric cards backed by data: verified sources, stale jobs expired, reports resolved, no-fee policy.
- Add onboarding checklists in `src/app/(candidate)/dashboard/page.tsx`, `src/app/(employer)/employer/page.tsx`, and `src/app/(admin)/admin/page.tsx`.
- Turn AI tools into a connected workflow: analyze resume, save target role, get matching jobs, create interview plan, track applications.

## UI Audit

Score: 74/100.

Page findings:

- Homepage: strong visual identity, but company marquee appears like partner proof without validation. Replace with "companies and career sites we monitor" or actual verified employer logos.
- Navbar: compact and usable; add active state and expose Career Guide/Blog in a secondary menu.
- Footer: good internal links; add trust, safety, refund, and report-job links.
- Jobs: filters exist, but `src/components/jobs/filters.tsx` should use accessible styled controls and canonical filter chips.
- Job detail: ensure official link, date checked, apply fee warning, source, and report action are above the fold.
- Candidate dashboard: needs an onboarding checklist and "next best action" card.
- Employer dashboard: needs job quality score, missing fields, applicant funnel, and posting trust guidance.
- Admin dashboard: needs operational queue grouping by urgency: reports, pending employer jobs, stale jobs, ingestion failures.
- Login/signup: clear enough; add provider-specific error state, password visibility toggle, and trust/privacy text.
- Pricing: improve comparison with role-specific plan recommendations and money-back/refund handling.
- Resume Builder: make export, save, and ATS preview more prominent.
- Resume Analyzer: visually polished, but allow signed-in persistence and cost-safe usage limits.
- Interview Coach: add session history and role templates.
- Blog/Career Guide: good base; add author bio, updated date, and internal next-step modules.
- Government Jobs: missing H1 in production HTML; add explicit page H1.
- Internships: missing H1 in production HTML; add explicit page H1.
- 404: source has `src/app/not-found.tsx`, but catch-all route masks some misses; fix route behavior.

## UX Audit

Score: 74/100.

Problems:

- User journeys are present but not connected strongly enough.
- Search and filters rely heavily on text input; add common chips for city, fresher, remote, salary, verified, deadline, and government.
- Empty states are present in some areas but should recommend actions.
- Form success states should be explicit, especially for resume upload, apply, report, employer posting, and payment.
- Role redirects are handled, but user-facing messaging around "why was I redirected" is thin.

Exact improvements:

- Add `NextBestActionCard` to dashboard pages.
- Add saved search and job alert prompts to `src/components/jobs/jobs-list.tsx`.
- Add persistent "Report suspicious job" guidance on job detail and apply panel.
- Add keyboard testing for sheet nav, filters, upload controls, and dashboard tables.

## CRO Audit

Score: 73/100.

Highest-impact changes:

- Hero CTA should split by intent: "Find verified jobs" and "Analyze my resume."
- Add trust badges above fold: verified sources, no candidate fees, official links first, stale jobs removed.
- Add social proof only when truthful: real usage count, real employers, real testimonials.
- Add WhatsApp job alerts after successful search and after empty results.
- Add email/WhatsApp capture on government job detail pages for deadline reminders.
- Add pricing nudges after high-intent actions: resume export, repeated AI analysis, employer posting.

Expected impact: better first-session activation, more saved searches, higher signup conversion, more employer lead capture, and higher tool-to-application conversion.

## SEO Audit

Score: 76/100.

Critical:

- Fix soft-404s in `src/app/[slug]/page.tsx`.
- Add visible H1s to government jobs, internships, and learning roadmap.
- Replace duplicate "2026 2026" government job title templates in `src/app/(marketing)/government-jobs/[segment]/page.tsx`.
- Convert `/api/og` to PNG via `ImageResponse` or a static PNG.

High:

- Add canonical handling for query pages: `/jobs?page=2`, filtered pages, and city/category pages.
- Add structured breadcrumbs with absolute URLs, not relative `item: "/"`.
- Add `dateModified`, author, reviewer, and source fields to government jobs.
- Limit sitemap to canonical, indexable pages and split large sitemaps when growth exceeds limits.

Medium:

- Add city pages for top Indian markets: Delhi, Bengaluru, Mumbai, Hyderabad, Pune, Chennai, Gurgaon, Noida, Chandigarh, Jaipur, Lucknow.
- Add programmatic pages for "fresher jobs in city", "remote jobs in role", "government jobs by state".
- Add internal link modules on every job detail: similar city, similar skills, career guide, resume tool.

Low:

- Improve alt text consistency.
- Add Twitter creator only if the account exists and is active.
- Add `Article` author bios and editorial policy.

## Code Audit

Score: 79/100.

Strengths:

- Uses Next.js 16 App Router, route groups, `src/proxy.ts`, typed pages, server/client split, Supabase helpers, and tests.
- Service-role Supabase client is server-only and lazily initialized in `src/lib/supabase/admin.ts`.
- Production build and TypeScript pass.

Refactors:

- Split `src/lib/jobs/live.ts` into `government-job-adapter.ts`, `ncs-fetcher.ts`, `public-jobs-query.ts`, and `job-cache.ts`.
- Move generated/temp scripts out of lint scope or delete `tmp`.
- Create shared `requireUser`, `requireCandidate`, `requireEmployer`, `requireAdmin` helpers and use them in route handlers as defense beyond proxy.
- Add a shared rate limiter wrapper for AI, analytics, report, webhook, and cron endpoints.
- Use explicit response types for all API routes.
- Add route-level tests for auth required, invalid payload, duplicate apply, and rate limits.

## Database Audit

Score: 80/100.

Strengths:

- RLS is enabled broadly.
- Jobs, applications, resumes, saved jobs, match scores, reports, payments, analytics, and profile tables exist.
- Useful indexes exist on job status, location, skills, search vector, applications, saved jobs, and reports.

Risks:

- `users create analytics events` uses `with check (true)`.
- `users create job reports` allows public inserts; add captcha/rate limit/server validation.
- Role helper reads `public.users`; ensure role cannot be self-escalated through user update policies.
- Functions should be audited for `security definer` exposure and execute grants.
- Storage policies are not visible in `schema.sql`; add audited policies for resume buckets.

## Security Audit

Score: 82/100.

Good:

- Next `16.2.9` and React `19.2.4` are on patched lines.
- `next.config.ts` removes powered-by header and adds `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Razorpay webhook verifies HMAC with `timingSafeEqual`.
- Resume upload validates filename, MIME type, and 5 MB file size.
- Proxy uses Supabase `getUser()`, not `getSession()`.

Missing:

- Add CSP, `Cross-Origin-Opener-Policy`, and `X-Robots-Tag` where needed.
- Add real rate limiting for AI endpoints.
- Protect cron routes with a shared secret.
- Add replay protection to payment and WhatsApp webhooks.
- Remove authorization dependence on `user_metadata` fallbacks.
- Add audit logs for admin actions, employer job edits, payment changes, and verification changes.

## Performance Audit

Score: 80/100.

Good:

- Production is cached by Vercel.
- Home page is ISR with 5-minute revalidation.
- Build produces static/SSG pages for many marketing and SEO surfaces.
- Image optimization is used for the logo.

Issues:

- `/api/jobs/search` returns about 309 KB without obvious pagination.
- Some page data depends on large in-memory/static arrays and unified job loading.
- `src/lib/jobs/live.ts` query loads all approved jobs for multiple surfaces.
- OG image is SVG and generated dynamically.

Fixes:

- Enforce `limit`, `page`, and max payload size in `src/app/api/jobs/search/route.ts`.
- Cache popular filters with `unstable_cache` tags and invalidate on job changes.
- Add database-level search pagination using indexed `search_vector`, city, work mode, and status filters.
- Add Lighthouse CI for 320, 375, 768, 1024, and 1440 widths.

## Job Platform Audit

Score: 79/100.

The platform has search, filters, job cards, details, government jobs, internships, saved jobs, applications, reports, employer posting, and AI match features. To compete with Naukri, Indeed, LinkedIn, Apna, Internshala, and Glassdoor, it needs stronger trust signals and workflow continuity.

Immediate upgrades:

- Add "verified by JobPulse" and "official source" logic to every job card.
- Add "last checked" and "expires soon" chips.
- Add application requirements preview before the apply button.
- Add candidate match reasons, not just scores.
- Add employer verification and company profile depth before allowing broad distribution.

## Admin Audit

Score: 77/100.

Admin has jobs, review, fetched jobs, sources, users, payments, blog, internships, government jobs, and SEO routes. The queue model should become operations-first.

Implementation:

- Add dashboard counts by severity: pending approvals, suspicious reports, stale jobs, failed ingestion, missing official links.
- Add bulk actions with confirmation and audit logs.
- Add source health table: last fetch, success rate, robots status, records created, duplicate rate.
- Add admin-only "preview as candidate/employer" for QA.

## Growth Audit

Score: 75/100.

Growth engine should be:

- Programmatic SEO for city, role, category, state, government exam, internship city, and fresher pages.
- WhatsApp deadline reminders for government jobs.
- Saved search alerts for candidates.
- Employer lead magnets: free job quality audit and salary benchmark.
- LinkedIn posts from verified job data.
- YouTube shorts from career guides and government-job explainers.
- Backlink strategy via college placement cells, coaching institutes, and local career communities.

## AI Audit

Score: 68/100.

Existing AI surfaces:

- Career agent: `src/app/api/ai/career-agent/route.ts`
- Resume analyzer: `src/app/api/ai/resume-analyze/route.ts`
- Resume generator: `src/app/api/ai/resume-generator/route.ts`
- Interview routes: `src/app/api/ai/interview/*`
- Roadmap, salary, skill-gap, job-match APIs

Critical improvements:

- Add rate limits by IP and user.
- Require auth or low free quota for file-based AI calls.
- Add cost telemetry per endpoint and model.
- Add prompt versioning in analytics.
- Add "not career/legal/financial guarantee" safety language.
- Ground job recommendations in current visible jobs and include source links.
- Cache deterministic career roadmaps and salary responses.

## Accessibility Audit

Score: 72/100.

Fix:

- Add visible H1 to government jobs, internships, and learning roadmap.
- Replace decorative low-contrast text in dark surfaces where contrast is below WCAG AA.
- Ensure all custom selects in filters have accessible labels and focus states.
- Ensure sheet menu traps focus and returns focus after close.
- Add skip link to main content.
- Add error summaries to long forms.
- Test with keyboard only and screen reader snapshots.

## Mobile Audit

Score: 74/100.

Must test and tune:

- 320 px: hero search, nav sheet, resume analyzer two-column layout collapse, pricing cards.
- 375/390 px: job card action buttons and filter drawer.
- 768 px: dashboard tables, admin queues, employer job forms.
- 1024 px: header nav density and dashboard sidebars.
- 1440+ px: avoid stretched text lines and overly wide cards.

The layout generally uses responsive grids, but the resume analyzer has a very large output panel and needs mobile-specific shortening.

## Testing

Verified:

- TypeScript: passed with `npx tsc --noEmit`.
- Build: passed with `npm run build`.
- Unit tests: passed with `npm run test`, 8 suites and 21 tests.

Failing:

- Lint: fails due to generated temp file and warnings in scripts.
- E2E: fails during global setup because `scripts/setup-e2e.mjs` cannot create a database user.

Required coverage:

- Guest: home, search, filters, job detail, AI public pages, signup, login.
- Candidate: profile, resume upload, analyze, save job, apply, dashboards.
- Employer: profile, post job, edit job, applicants, analytics.
- Admin: approve/reject, reports, users, payments, ingestion, SEO.
- Security: protected routes, role mismatch redirects, API unauthorized responses, webhook signatures, cron secrets.

## Top 100 Improvements

1. Return 404 for unknown catch-all slugs in `src/app/[slug]/page.tsx`.
2. Exclude `tmp` from lint or remove generated files.
3. Fix e2e database setup.
4. Add real API rate limiting.
5. Add H1s to missing landing pages.
6. Paginate `/api/jobs/search`.
7. Convert OG image to PNG.
8. Add CSP.
9. Protect cron routes with secrets.
10. Add webhook replay protection.
11. Remove `user_metadata` role fallback for authorization.
12. Add admin audit logs.
13. Add candidate onboarding checklist.
14. Add employer onboarding checklist.
15. Add source health dashboard.
16. Add report-job queue priority.
17. Add verified source badges.
18. Add official link first on government pages.
19. Add last-checked timestamps.
20. Add stale job auto-expiry visibility.
21. Add saved search alerts.
22. Add WhatsApp alerts after searches.
23. Add deadline reminders.
24. Add job quality score for employers.
25. Add company profile completeness.
26. Add application status timeline.
27. Add interview history.
28. Add resume version history.
29. Add AI prompt version telemetry.
30. Add AI cost tracking.
31. Add AI response caching.
32. Add hallucination disclaimers.
33. Add source-linked AI job suggestions.
34. Add city pages.
35. Add role pages.
36. Add fresher city pages.
37. Add internship city pages.
38. Add government state pages.
39. Add breadcrumbs with absolute URLs.
40. Split sitemap when large.
41. Add canonical for filtered pages.
42. Add noindex for low-value filters.
43. Add author and reviewer metadata.
44. Fix repeated year in titles.
45. Add editorial policy.
46. Add trust and safety page.
47. Add refund policy.
48. Add report scam page.
49. Add real testimonials.
50. Replace unverified marquee company names.
51. Add CTA hierarchy per persona.
52. Add employer lead capture.
53. Add candidate activation email.
54. Add WhatsApp opt-in consent copy.
55. Add password visibility toggle.
56. Add auth error mapping coverage.
57. Add form-level error summaries.
58. Add skip link.
59. Improve focus rings.
60. Audit color contrast.
61. Add keyboard e2e tests.
62. Add mobile visual tests.
63. Add Lighthouse CI.
64. Add bundle analysis.
65. Split `src/lib/jobs/live.ts`.
66. Split admin dashboard modules.
67. Centralize route guards.
68. Centralize API validation responses.
69. Add typed API response helpers.
70. Add Supabase storage policy migrations.
71. Tighten analytics insert policy.
72. Tighten job reports insert policy.
73. Add duplicate-report protection.
74. Add DB advisor checks to CI.
75. Add migration verification.
76. Add seed data reset for e2e.
77. Add mocked payment e2e flow.
78. Add mocked AI e2e flow.
79. Add unauthenticated API tests.
80. Add role mismatch tests.
81. Add job apply duplicate tests.
82. Add resume upload malware/content scanning plan.
83. Add file extension and magic-byte validation.
84. Add upload lifecycle cleanup.
85. Add delete account/export data.
86. Add privacy consent records.
87. Add notification preferences.
88. Add salary benchmark pages.
89. Add career guide internal CTAs.
90. Add blog content clusters.
91. Add employer case studies.
92. Add structured FAQ to more pages.
93. Add app monitoring dashboard.
94. Add error budget SLOs.
95. Add ingestion failure alerts.
96. Add payment reconciliation alerts.
97. Add admin action confirmation dialogs.
98. Add bulk import validation previews.
99. Add data freshness badges.
100. Add production runbook.

## Top 50 UI Improvements

1. Add active nav state.
2. Add secondary menu for Blog/Career Guide.
3. Replace nested rounded panels with flatter sections on marketing pages.
4. Add visible H1s.
5. Improve filter control styling.
6. Add filter chips.
7. Add empty-state CTAs.
8. Add error summaries.
9. Add success toasts.
10. Add dashboard onboarding cards.
11. Add job trust badges.
12. Add "last checked" labels.
13. Add official source block.
14. Add report-job CTA.
15. Add saved-search prompt.
16. Add application timeline.
17. Add resume preview.
18. Add export button prominence.
19. Add interview session cards.
20. Add admin priority queue cards.
21. Add source health table.
22. Add employer posting checklist.
23. Add pricing plan recommendation.
24. Add refund/support link on pricing.
25. Add mobile sticky apply CTA.
26. Add mobile filter drawer.
27. Add compact job card variant.
28. Add salary disclosure chips.
29. Add deadline urgency chips.
30. Add role-specific search suggestions.
31. Add city suggestion autocomplete.
32. Add profile completeness meter.
33. Add company verification meter.
34. Add upload progress.
35. Add skeletons for dashboard tables.
36. Add loading states for AI tools.
37. Add disabled states with reasons.
38. Add accessibility skip link.
39. Add consistent icon sizes.
40. Reduce oversized card radii where not needed.
41. Add editorial trust strip.
42. Add job details table of contents.
43. Add government job important dates card.
44. Add internship stipend/date badges.
45. Add footer trust links.
46. Add page-level breadcrumbs.
47. Add "copy link" job action.
48. Add "share on WhatsApp" action.
49. Add admin preview mode.
50. Add responsive table cards.

## Top 50 CRO Improvements

1. Hero CTA: "Find verified jobs".
2. Secondary CTA: "Analyze my resume".
3. Add trust badges above fold.
4. Add live job count with freshness.
5. Add official source count.
6. Add candidate no-fee promise.
7. Add employer CTA above fold.
8. Add resume analyzer signup prompt after result.
9. Add save-search prompt after first search.
10. Add WhatsApp alerts after empty results.
11. Add government deadline reminders.
12. Add pricing trigger after repeated AI use.
13. Add employer lead form.
14. Add free job quality audit.
15. Add application tracking value prop.
16. Add candidate dashboard preview.
17. Add employer dashboard preview.
18. Add real testimonials.
19. Add trust and safety page links.
20. Add support response promise.
21. Add social proof from real data.
22. Add comparison against traditional job boards.
23. Add resume builder export CTA.
24. Add interview prep after apply.
25. Add job match explanation CTA.
26. Add account creation after saving.
27. Add one-click Google auth if supported.
28. Add referral prompt after successful application.
29. Add employer featured listing upsell.
30. Add plan recommendations by employer size.
31. Add deadline urgency on job cards.
32. Add salary transparency badges.
33. Add verified employer filter.
34. Add city landing CTAs.
35. Add blog article CTA modules.
36. Add career guide next steps.
37. Add lead magnets for freshers.
38. Add placement-cell partnership CTA.
39. Add WhatsApp opt-in trust copy.
40. Add abandoned signup recovery.
41. Add abandoned resume recovery.
42. Add "complete your profile" reminders.
43. Add saved jobs email digest.
44. Add daily government jobs digest.
45. Add applicant quality insights for employers.
46. Add demo data for employers.
47. Add clear cancellation/refund copy.
48. Add plan feature comparison.
49. Add monthly/yearly toggle.
50. Add conversion event instrumentation.

## Top 50 SEO Improvements

1. Fix soft-404s.
2. Add H1s.
3. Fix repeated year titles.
4. Convert OG image to PNG.
5. Add absolute breadcrumb URLs.
6. Add canonical for query pages.
7. Noindex thin filters.
8. Split sitemap when needed.
9. Add city pages.
10. Add role pages.
11. Add fresher city pages.
12. Add internship city pages.
13. Add government state pages.
14. Add government exam pages.
15. Add salary pages.
16. Add company pages.
17. Add author bios.
18. Add reviewer metadata.
19. Add date modified.
20. Add editorial policy.
21. Add source citation blocks.
22. Add FAQ schema to tools.
23. Add HowTo schema where valid.
24. Add JobPosting schema validation tests.
25. Add image alt audit.
26. Add internal link modules.
27. Add breadcrumbs UI.
28. Add related jobs.
29. Add related career guides.
30. Add related blog posts.
31. Add noindex dashboard/payment pages.
32. Add robots tests.
33. Add sitemap tests.
34. Add broken link CI.
35. Add content freshness score.
36. Add title length checks.
37. Add description length checks.
38. Add duplicate title detection.
39. Add duplicate content detection.
40. Add Google Jobs required field tests.
41. Add validThrough checks.
42. Add salary field validation.
43. Add directApply only when true.
44. Add remote job location rules.
45. Add organization sameAs verification.
46. Add canonical host consistency.
47. Add indexable page inventory.
48. Add Search Console monitoring.
49. Add schema error monitoring.
50. Add content pruning workflow.

## Top 50 Performance Improvements

1. Paginate job search API.
2. Cap API response sizes.
3. Cache popular searches.
4. Add search result streaming.
5. Add DB pagination.
6. Add partial indexes for active approved jobs.
7. Add query explain checks.
8. Split large job modules.
9. Lazy-load non-critical marketing sections.
10. Optimize resume analyzer bundle.
11. Lazy-load charts.
12. Analyze Recharts bundle.
13. Optimize AI tool client bundles.
14. Add image dimensions everywhere.
15. Convert SVG OG to static/edge PNG.
16. Add preconnect only when needed.
17. Audit font loading.
18. Add Suspense boundaries for slow dashboard data.
19. Add admin table pagination.
20. Add employer applicants pagination.
21. Add API timeout wrappers.
22. Add external fetch circuit breakers.
23. Add stale fallback for job ingestion.
24. Add cache tags for jobs.
25. Revalidate only affected paths.
26. Use DB counts instead of loading arrays for stats.
27. Avoid fetching all jobs for simple counts.
28. Add CDN cache headers for public APIs where safe.
29. Add client-side debouncing for filters.
30. Add server-side search normalization.
31. Add Lighthouse budgets.
32. Add bundle budgets.
33. Add slow route logging.
34. Add AI timeout budgets.
35. Add Supabase query time logging.
36. Add connection pooling review.
37. Add storage signed URL caching.
38. Add upload progress without blocking UI.
39. Add skeletons for route transitions.
40. Add static generation for more landing pages.
41. Avoid unnecessary dynamic rendering.
42. Validate proxy matcher cost.
43. Exclude static assets from proxy.
44. Add browser performance tests.
45. Add mobile performance tests.
46. Add INP interaction audits.
47. Add CLS screenshot checks.
48. Add LCP element tracking.
49. Add server timing headers.
50. Add production performance dashboard.

## Top 50 Code Refactors

1. Split `src/lib/jobs/live.ts`.
2. Split admin actions.
3. Centralize auth guards.
4. Centralize API errors.
5. Centralize rate limits.
6. Centralize webhook verification.
7. Centralize cron verification.
8. Add typed route responses.
9. Add API schema exports.
10. Add job query repository.
11. Add dashboard data repositories.
12. Move adapters to `src/server`.
13. Move constants from components to data files.
14. Add feature folders.
15. Add route-level tests.
16. Add component a11y tests.
17. Add storage policy migrations.
18. Add DB advisor scripts.
19. Add seed reset script.
20. Add e2e fixture isolation.
21. Add mock AI provider.
22. Add mock payment provider.
23. Add external source mocks.
24. Remove temp files from repo.
25. Fix ESLint coverage.
26. Add strict no-console rules for app code.
27. Add logging abstraction.
28. Add monitoring abstraction.
29. Add analytics event type enum.
30. Add audit event type enum.
31. Add job status transition service.
32. Add employer verification service.
33. Add candidate verification service.
34. Add notification service.
35. Add email/WhatsApp provider interfaces.
36. Add duplicate job resolution service.
37. Add canonical slug service.
38. Add content freshness service.
39. Add sitemap inventory tests.
40. Add robots tests.
41. Add security header tests.
42. Add file upload tests.
43. Add webhook tests.
44. Add cron tests.
45. Add payment reconciliation tests.
46. Add admin bulk action tests.
47. Add search scoring tests.
48. Add job recommendation tests.
49. Add AI prompt regression tests.
50. Add release checklist.

## Implementation Roadmap

### 24 Hours

1. Fix `src/app/[slug]/page.tsx` to return `notFound()` for unknown SEO slugs.
2. Fix lint by excluding/deleting `tmp` and resolving script warnings.
3. Add H1s to government jobs, internships, and learning roadmap.
4. Add hard max page size to `/api/jobs/search`.
5. Add cron secret validation audit for all cron routes.

### 7 Days

1. Fix e2e setup and make guest/candidate/employer/admin smoke tests pass.
2. Add real rate limiting to AI, report, analytics, and auth-adjacent endpoints.
3. Add CSP and security header tests.
4. Add canonical/noindex strategy for filter pages.
5. Add verified source and last-checked UI to job cards/detail pages.

### 30 Days

1. Launch saved searches and WhatsApp/email alerts.
2. Build admin operations dashboard with queue severity.
3. Split `src/lib/jobs/live.ts` and add query performance tests.
4. Add programmatic city/role/category pages with content quality checks.
5. Add AI telemetry, cost controls, prompt versioning, and grounded responses.

### 90 Days

1. Build trust and safety moat: scam detection, verified employers, public source transparency, report resolution SLAs.
2. Build growth engine: partnerships, content clusters, deadline reminders, referral loops, employer acquisition.
3. Add production observability: SLOs, alerts, dashboards, error budgets, ingestion monitoring.
4. Add mature monetization: plan entitlements, usage quotas, employer analytics, premium candidate tools.
5. Run recurring audits until production readiness, SEO, accessibility, performance, security, UX, CRO, and code quality are all above 95.
