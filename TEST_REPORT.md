# TEST REPORT

## Scope

End-to-end QA automation was added with Playwright for:

- Guest
- Candidate
- Employer
- Admin
- Security / access control

Artifacts created:

- `playwright.config.ts`
- `scripts/setup-e2e.mjs`
- `e2e/*`

## Commands Run

- `npm run test:e2e`
- `npx playwright test e2e/candidate.spec.ts e2e/employer.spec.ts`
- `npm run lint`
- `npm test`
- `npm run build`

## Passed

- `npm run build`
  Result: passed

- Playwright setup/bootstrap
  Result: browsers installed, fixtures generated, suite executed successfully

- Unit test suites that passed under `npm test`
  - `src/lib/candidate/job-match.test.ts`
  - `src/server/job-fetcher/location-filter.test.ts`
  - `src/lib/salary/calculator.test.ts`
  - `src/server/job-fetcher/parsers.test.ts`
  - `src/lib/ai/career-agent.test.ts`
  - `src/components/jobs/job-card.test.tsx`

- Direct Supabase credential verification
  Result: `admin.demo@jobpulse.test / JobPulse123` is valid at the auth layer

## Failed

### `npm run test:e2e`

Result: `8/8` specs failed

Failed areas:

- Admin login / admin route access
- Candidate signup and downstream candidate flow
- Employer signup and downstream employer flow
- Guest public jobs/search/detail flow
- Candidate profile RLS/security check
- Employer cross-tenant mutation security check
- Admin route protection check

### `npm run lint`

Result: failed

Blocking error:

- [src/components/jobs/job-personalization-context.tsx](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/src/components/jobs/job-personalization-context.tsx:61)
  - `react-hooks/set-state-in-effect`
  - Synchronous `setState` inside `useEffect`

### `npm test`

Result: failed

Failed suites:

- `src/lib/jobs/visibility.test.ts`
- `src/lib/jobs/search.test.ts`

Error:

- `ReferenceError: Request is not defined`

## Exact Bugs Found

### 1. Protected-route login/session handoff is broken

Severity: critical

Evidence:

- Valid admin credentials authenticate directly with Supabase
- Browser login remains on `/login`
- Admin spec fails waiting for `/admin`
- Login UI stays stuck in `Signing in...`

Likely impact:

- Candidate, employer, and admin users cannot reliably enter protected workspaces after login

Screenshot:

- [Admin login stuck](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/test-results/admin-Admin-flows-admin-ca-438ff-ove-reject-and-feature-jobs-chromium/test-failed-1.png)

Recommendation:

- Inspect the client-to-server session bridge after `signInWithPassword`
- Verify cookies are written before `router.push`
- Audit proxy auth handling in [src/lib/supabase/proxy.ts](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/src/lib/supabase/proxy.ts:1)
- Consider moving login to a server action or explicitly waiting for a confirmed session before redirecting

### 2. No active public jobs are available

Severity: high

Evidence:

- `/jobs` renders `0` active jobs
- Guest search/detail/apply flows are blocked because no public listing exists

Screenshot:

- [Public jobs empty state](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/test-results/guest-Guest-journeys-homep-c793d-and-public-job-search-works-chromium/test-failed-1.png)

Recommendation:

- Seed at least one approved active job in non-production QA/dev environments
- Audit `status`, `approval_status`, and public visibility filters used by the jobs page
- Validate ingestion/admin moderation is producing publicly visible inventory

### 3. `candidate_profiles` is not writable/readable for authenticated users

Severity: critical

Evidence:

- Supabase returns `42501 permission denied for table candidate_profiles`
- Hint returned by Supabase explicitly requests grants for `authenticated`

Impact:

- Candidate onboarding cannot work reliably
- Security test for candidate data isolation is blocked at the table permission layer

Recommendation:

- Grant the required table access to `authenticated`
- Add or verify RLS policies for self-only `SELECT/INSERT/UPDATE`
- Re-test candidate onboarding and dashboard profile save immediately after the RLS fix

### 4. Signup is blocked by auth rate limiting

Severity: medium

Evidence:

- Candidate/employer signup attempts returned `email rate limit exceeded`

Screenshot:

- [Signup rate limit error](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/test-results/candidate-Candidate-flows--b0f53-didate-can-complete-journey-chromium/test-failed-1.png)

Recommendation:

- For QA environments, relax Supabase auth email rate limits or use approved seeded accounts
- Improve the signup UX copy to clearly explain retry timing

### 5. Jest environment is missing web API globals for Next cache-based tests

Severity: medium

Evidence:

- `src/lib/jobs/visibility.test.ts`
- `src/lib/jobs/search.test.ts`
- Error: `Request is not defined`

Recommendation:

- Add `Request`, `Response`, and `fetch` polyfills in Jest setup for these suites, or move them to a Node test environment that provides them

### 6. Full-project lint catches a real hook issue in job personalization context

Severity: medium

Evidence:

- [src/components/jobs/job-personalization-context.tsx](/C:/Users/Amrit/Desktop/New%20folder/jobpulse-india/src/components/jobs/job-personalization-context.tsx:61)
- `react-hooks/set-state-in-effect`

Recommendation:

- Refactor the effect so derived empty-state initialization does not synchronously call `setState` from within `useEffect`

## Fix Recommendations Summary

1. Fix login/session persistence first.
2. Repair `candidate_profiles` grants/RLS second.
3. Ensure at least one approved active public job is always available in QA/dev.
4. Add stable QA auth strategy for signup-heavy tests to avoid rate limiting.
5. Polyfill `Request`/web APIs for Jest or split those suites into a Node-compatible config.
6. Refactor the `job-personalization-context.tsx` hook pattern flagged by lint.

## Notes

- I patched the local QA harness so Playwright can run cleanly against local dev origins and so generated Playwright artifacts do not pollute lint/Jest.
- The remaining failures above are the meaningful app/environment issues still blocking successful end-to-end coverage.
