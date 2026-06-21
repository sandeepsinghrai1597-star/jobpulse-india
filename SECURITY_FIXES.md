# Security Fixes

## What Was Found

- `.env` exists locally with sensitive-looking values. It is ignored by Git and is not tracked, but the values inside it still need to be treated as exposed if they were shared, pasted into tools, or used in logs.
- `.gitignore` protection for environment files needed to stay explicit so `.env` is clearly blocked from commits while `.env.example` remains trackable.
- `.env.example` needed to stay placeholder-only so no deployable secrets or production-specific values are shipped in the repository.
- Secret-bearing modules needed hard server-only boundaries so the Supabase service-role key and server API keys cannot be imported into client bundles.
- The current tracked codebase did not contain a real Supabase service-role key, database connection string, Razorpay secret, Gemini key, or other obvious hardcoded secret based on the repository scan performed during this audit.
- No client component in `src` imports `@/lib/supabase/admin`, `@/lib/ai/gemini`, or `@/lib/analytics/server`.

## What Was Fixed

- Kept explicit `.env`, `.env.local`, `.env.development`, and `.env.production` ignore rules in `.gitignore`, with `.env.example` still allowlisted for onboarding.
- Replaced `.env.example` with placeholder-only values and added the missing `SUPABASE_DATABASE_PASSWORD` entry so developers know it is required without exposing a real value.
- Added `server-only` guards to secret-bearing modules:
  - `src/lib/supabase/admin.ts`
  - `src/lib/ai/gemini.ts`
  - `src/lib/analytics/server.ts`
- Confirmed the service-role key is only read in server-side code paths and is never referenced from any client component.
- Added security guidance in `README.md` so developers see the rotation requirement and server-only secret boundary during setup and deployment.

## Keys That Must Be Rotated

Rotate these immediately if they were ever committed, shared outside the trusted team, pasted into chat, or exposed in logs/build output:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DATABASE_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`

Recommended follow-up rotation based on your environment usage:

- `CRON_SECRET`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `GA4_API_SECRET`

## Production Environment Variable Checklist

- `NEXT_PUBLIC_SITE_URL` is set to the production HTTPS origin.
- `NEXT_PUBLIC_SUPABASE_URL` points to the correct Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set with the public client key only.
- `SUPABASE_SERVICE_ROLE_KEY` is set only in server environments and never referenced from client components.
- `SUPABASE_DATABASE_PASSWORD` is stored only in secure secret managers and never committed.
- `CRON_SECRET` is set and required by cron routes.
- `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` is set only for server-side AI routes.
- `RAZORPAY_KEY_ID` may be returned to the browser, but `RAZORPAY_KEY_SECRET` must remain server-side only.
- `RAZORPAY_WEBHOOK_SECRET` is configured for webhook signature verification.
- `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_WEBHOOK_VERIFY_TOKEN` are set only if the integration is enabled.
- `GA4_API_SECRET` is server-side only.
- Vercel, CI, and local `.env` values match the intended environment and do not reuse old leaked credentials.
