import { buildJobSourceConfig } from "@/lib/jobs/source-config";
import { filterJobsForSourceLocationScope } from "@/server/job-fetcher/location-filter";
import type { ExtractedRawJob, JobSourceRecord } from "@/server/job-fetcher/types";

function createSource(config: JobSourceRecord["config"] = null): JobSourceRecord {
  return {
    id: "source-1",
    name: "Punjab Feed",
    source_type: "official",
    transport_type: "government",
    source_url: "https://example.gov.in/jobs",
    status: "active",
    allow_auto_fetch: true,
    config,
    notes: null,
    last_fetched_at: null,
  };
}

function createJob(overrides?: Partial<ExtractedRawJob>): ExtractedRawJob {
  return {
    raw_title: "Software Engineer",
    raw_company: "Acme",
    raw_location: "Mohali, Punjab",
    raw_description: "Hiring now in Punjab",
    raw_apply_url: "https://example.gov.in/jobs/software-engineer",
    raw_salary: null,
    raw_experience: null,
    raw_job_type: null,
    raw_posted_date: null,
    raw_deadline: null,
    raw_data_json: {},
    ...overrides,
  };
}

describe("filterJobsForSourceLocationScope", () => {
  it("keeps all jobs when no location keywords are configured", () => {
    const jobs = [
      createJob(),
      createJob({ raw_title: "Accountant", raw_location: "Jaipur, Rajasthan" }),
    ];

    expect(filterJobsForSourceLocationScope(createSource(null), jobs)).toHaveLength(2);
  });

  it("keeps only Punjab-matching jobs for scoped feeds", () => {
    const source = createSource(
      buildJobSourceConfig({
        sourceType: "government-source",
        defaultCity: "Chandigarh",
        defaultState: "Punjab",
        coverageRegion: "punjab",
        locationKeywords: ["punjab", "mohali", "chandigarh"],
      }),
    );

    const jobs = [
      createJob({ raw_title: "Field Sales Executive", raw_location: "Mohali, Punjab" }),
      createJob({ raw_title: "Support Associate", raw_location: "Pune, Maharashtra", raw_description: "Onsite Pune role" }),
      createJob({ raw_title: "Nurse", raw_location: null, raw_description: "Walk-in drive in Chandigarh campus" }),
    ];

    const filtered = filterJobsForSourceLocationScope(source, jobs);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((job) => job.raw_title)).toEqual(["Field Sales Executive", "Nurse"]);
  });
});
