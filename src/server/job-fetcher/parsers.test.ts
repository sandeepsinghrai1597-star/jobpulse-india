import { buildJobSourceConfig } from "@/lib/jobs/source-config";
import { generateContentHash } from "@/server/job-fetcher/dedupe";
import { extractRawJobsFromPayload } from "@/server/job-fetcher/parsers";
import { isUrlAllowedForSource } from "@/server/job-fetcher/source-runner";
import type { JobSourceRecord, SourcePayload } from "@/server/job-fetcher/types";

function createSource(overrides?: Partial<JobSourceRecord>): JobSourceRecord {
  return {
    id: "source-1",
    name: "Acme Careers",
    source_type: "company_career_page",
    transport_type: "html",
    source_url: "https://careers.acme.com/jobs",
    status: "active",
    allow_auto_fetch: true,
    config: null,
    notes: null,
    last_fetched_at: null,
    ...overrides,
  };
}

describe("job fetcher html parser", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("extracts official career-page cards and enriches from same-domain detail pages", async () => {
    const source = createSource();
    const payload: SourcePayload = {
      contentType: "text/html",
      fetchedUrl: "https://careers.acme.com/jobs",
      status: 200,
      body: `
        <html>
          <body>
            <article class="job-card opening">
              <h2>Frontend Engineer</h2>
              <p>Location: Bengaluru, Karnataka</p>
              <a href="/jobs/frontend-engineer">View role</a>
            </article>
          </body>
        </html>
      `,
    };

    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "https://careers.acme.com/robots.txt") {
        return new Response("User-agent: *\nAllow: /\n", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }

      if (url === "https://careers.acme.com/jobs/frontend-engineer") {
        return new Response(
          `
            <html>
              <body>
                <main>
                  <section class="job-description">
                    Build polished product experiences with React, TypeScript, testing, and accessibility best practices across the web platform.
                  </section>
                </main>
              </body>
            </html>
          `,
          {
            status: 200,
            headers: { "content-type": "text/html" },
          },
        );
      }

      throw new Error(`Unexpected fetch for ${url}`);
    });

    global.fetch = fetchMock as typeof fetch;

    const jobs = await extractRawJobsFromPayload(source, payload);

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      raw_title: "Frontend Engineer",
      raw_location: "Bengaluru, Karnataka",
      raw_apply_url: "https://careers.acme.com/jobs/frontend-engineer",
    });
    expect(jobs[0].raw_description).toContain("React");
    expect(jobs[0].raw_data_json).toMatchObject({
      sourceUrl: "https://careers.acme.com/jobs",
      detail_url: "https://careers.acme.com/jobs/frontend-engineer",
      detailFetchAllowed: true,
    });
  });

  it("allows explicitly configured official detail domains", () => {
    const source = createSource({
      config: buildJobSourceConfig({
        sourceType: "company-career-page",
        allowedDetailDomains: ["jobs.acmegreenhouse.com"],
      }),
    });

    expect(isUrlAllowedForSource(source, "https://jobs.acmegreenhouse.com/openings/frontend-engineer")).toBe(true);
    expect(isUrlAllowedForSource(source, "https://evil.example.com/openings/frontend-engineer")).toBe(false);
  });

  it("extracts rss and atom fields into raw jobs using the item link as source and apply url", async () => {
    const source = createSource({
      transport_type: "rss",
      source_url: "https://feeds.acme.com/jobs.xml",
    });

    const payload: SourcePayload = {
      contentType: "application/rss+xml",
      fetchedUrl: "https://feeds.acme.com/jobs.xml",
      status: 200,
      body: `
        <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <channel>
            <item>
              <title>Data Engineer</title>
              <link>https://careers.acme.com/jobs/data-engineer</link>
              <description>Build pipelines and data products for analytics.</description>
              <company>Acme</company>
              <location>Pune, Maharashtra</location>
              <pubDate>Fri, 20 Jun 2026 10:00:00 GMT</pubDate>
              <category>Python</category>
              <category>ETL</category>
            </item>
            <entry>
              <title>Platform Engineer</title>
              <link href="https://careers.acme.com/jobs/platform-engineer" />
              <summary>Own infrastructure reliability and developer tooling.</summary>
              <author><name>Acme Platform</name></author>
              <published>2026-06-20T10:30:00Z</published>
              <category term="Kubernetes" />
              <category term="SRE" />
            </entry>
          </channel>
        </rss>
      `,
    };

    const jobs = await extractRawJobsFromPayload(source, payload);

    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      raw_title: "Data Engineer",
      raw_company: "Acme",
      raw_location: "Pune, Maharashtra",
      raw_apply_url: "https://careers.acme.com/jobs/data-engineer",
      raw_posted_date: "Fri, 20 Jun 2026 10:00:00 GMT",
    });
    expect(jobs[0].raw_data_json).toMatchObject({
      sourceUrl: "https://careers.acme.com/jobs/data-engineer",
      applyUrl: "https://careers.acme.com/jobs/data-engineer",
      categories: ["Python", "ETL"],
      skills: ["Python", "ETL"],
    });
    expect(jobs[1]).toMatchObject({
      raw_title: "Platform Engineer",
      raw_company: "Acme Platform",
      raw_apply_url: "https://careers.acme.com/jobs/platform-engineer",
      raw_posted_date: "2026-06-20T10:30:00Z",
    });
    expect(jobs[1].raw_data_json).toMatchObject({
      categories: ["Kubernetes", "SRE"],
      skills: ["Kubernetes", "SRE"],
    });
  });

  it("deduplicates feed items by url title and company", () => {
    const firstHash = generateContentHash({
      raw_title: "Backend Engineer",
      raw_company: "Acme",
      raw_location: "Remote",
      raw_description: "First description",
      raw_apply_url: "https://careers.acme.com/jobs/backend-engineer",
      raw_salary: null,
      raw_experience: null,
      raw_job_type: null,
      raw_posted_date: "2026-06-20",
      raw_deadline: null,
      raw_data_json: {},
    });

    const secondHash = generateContentHash({
      raw_title: "Backend Engineer",
      raw_company: "Acme",
      raw_location: "Bengaluru",
      raw_description: "Updated description",
      raw_apply_url: "https://careers.acme.com/jobs/backend-engineer",
      raw_salary: null,
      raw_experience: null,
      raw_job_type: "full-time",
      raw_posted_date: "2026-06-21",
      raw_deadline: null,
      raw_data_json: {},
    });

    expect(firstHash).toBe(secondHash);
  });
});
