# Job Ingestion Architecture

JobPulse India uses a staged ingestion pipeline for automated job intake.

## Flow

1. `job_sources`
   Stores approved source definitions.
   Each record has `source_url`, `source_type`, `transport_type`, and automation controls.

2. Fetcher
   `src/lib/jobs/ingestion.ts`
   Pulls content from allowed sources only.
   Blocked domains include LinkedIn, Naukri, Indeed, Apna, and Glassdoor.

3. Parser
   Supports RSS/Atom, JSON/API, CSV, and structured HTML/JSON-LD.

4. Normalizer
   Converts raw records into a consistent internal shape with:
   `title`, `company_name`, `location`, `skills`, `application_url`, `source_url`, and `source_type`.

5. Deduplication
   Each fetched item gets a SHA-256 fingerprint.
   The pipeline checks both published `jobs` rows and prior `job_ingestion_items`.

6. AI cleanup / enrichment
   Adds a lightweight enrichment payload for summaries, cleaned titles, and trust signals.
   The system uses Gemini when configured and deterministic fallback metadata otherwise.

7. Region scope filtering
   Sources can carry scoped `locationKeywords` and a `coverageRegion`.
   Broad feeds can therefore be limited to Punjab-only matches before they enter moderation.

8. Admin review
   All fetched items land in `job_ingestion_items` with `review_status = pending_review`.
   Admins review them at `/admin/jobs/fetched`.

9. Publish
   Approval creates a real row in `jobs` with:
   `approval_status = approved`
   `status = active`
   `published_at` set
   `source_url` and `source_type` preserved

10. Listing UI
   Public jobs search now reads all approved active jobs, not only admin-authored ones.

11. SEO-ready detail pages
    Published fetched jobs automatically flow into:
    `/jobs`
    `/jobs/[slug]`
    sitemap output
    schema markup on detail pages

## Safety guarantees

- No auto-publish from automation.
- Every fetched record keeps source provenance.
- Competitor-board URLs are rejected at source registration and fetch time.
- Duplicate and review state remain queryable for audit and moderation.
