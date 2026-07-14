# JobPulse India

Production-oriented Next.js App Router foundation for an AI job discovery and career companion platform built for Indian job seekers, students, freshers, recruiters, and local employers.

## Stack

- Next.js App Router
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth + PostgreSQL + Storage
- Gemini via Google AI Studio
- Razorpay payments
- Vercel deployment

## Included

- Homepage and marketing pages
- Jobs listing and job detail pages
- Candidate, employer, and admin dashboard shells
- Resume builder and analyzer route scaffolds
- Interview preparation route scaffold
- Government jobs and internships sections
- AI API route scaffolds with structured JSON output
- Razorpay order + webhook routes
- Sitemap and robots setup
- Supabase SQL migration and seed example
- Official live-source import scaffold for National Career Service

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start development:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Supabase

- Add your project URL and publishable key to `.env`
- Run the SQL inside [supabase/migrations/20260615_initial_schema.sql](./supabase/migrations/20260615_initial_schema.sql)
- Seed starter data with [supabase/seed.sql](./supabase/seed.sql)

## Deployment

- Deploy to Vercel
- Add the same environment variables in Vercel project settings
- Set `CRON_SECRET` in Vercel so cron requests are authenticated
- Vercel Cron runs `/api/cron/fetch-jobs` twice daily (see `vercel.json`)
- Fetched jobs that clear the quality gates are auto-published to the live board
  (`JOB_FETCH_AUTO_PUBLISH=false` disables this; `JOB_FETCH_AUTO_PUBLISH_MIN_QUALITY`
  adjusts the 0-100 threshold, default 60). Lower-quality jobs stay in
  `pending_review` for admin approval under `/admin/jobs/fetched`.
- Automatic ingestion only runs for sources configured in `/admin/job-sources`
  with **Allow auto fetch** enabled — add at least one active source.
- Connect GA4 and Search Console after production domain setup

## Security

- Keep `.env` local only and never commit it.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_PASSWORD`, `RAZORPAY_KEY_SECRET`, and other non-`NEXT_PUBLIC_*` secrets in server-only environment settings.
- Rotate `SUPABASE_SERVICE_ROLE_KEY`, any exposed publishable/anon Supabase key, and `SUPABASE_DATABASE_PASSWORD` immediately if they were ever committed, shared, or pasted into logs.
- Review [SECURITY_FIXES.md](./SECURITY_FIXES.md) before the next production deploy.

## Testing Checklist

- Run `npm run lint`
- Run `npm run build`
- Verify `/jobs`, `/jobs/[slug]`, `/career-agent`, `/government-jobs`, and `/internships`
- Check `/api/jobs/search`, `/api/ai/career-agent`, and `/api/payments/razorpay/create-order`
- Validate `robots.txt` and `sitemap.xml`

## Notes

- WhatsApp/n8n integration is intentionally deferred in this build.
- AI endpoints return mock-safe data when `GOOGLE_GENERATIVE_AI_API_KEY` is missing.
- Supabase and Razorpay clients are initialized lazily to keep builds safe.
- Set `ENABLE_LIVE_JOB_IMPORT=true` to merge public National Career Service opportunities into the jobs UI and sync API.
- Third-party aggregator copying is intentionally not implemented; official-source imports are the safe default.
- The admin source screen now includes a Punjab source pack and a Punjab-only pipeline runner that stages Punjab-matching jobs into review before publishing.
