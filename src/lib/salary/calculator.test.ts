import type { Job } from "@/types";
import {
  buildSalaryCalculatorResult,
  normalizeSalaryCalculatorInput,
  SALARY_DISCLAIMER,
  type SalaryDataRow,
} from "@/lib/salary/calculator";

const jobs: Job[] = [
  {
    id: "job-1",
    slug: "data-analyst-delhi",
    title: "Data Analyst",
    companyName: "Insight Ladder",
    companyLogo: "IL",
    description: "Analyze dashboards and business reports.",
    responsibilities: [],
    requirements: [],
    skills: ["SQL", "Excel", "Power BI", "Python"],
    salaryMin: 400000,
    salaryMax: 700000,
    salaryType: "yearly",
    location: "Delhi, Delhi",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    workMode: "hybrid",
    experienceRequired: "1-3 years",
    educationRequired: "BCA",
    jobType: "full-time",
    industry: "Analytics",
    openings: 2,
    applicationDeadline: "2026-07-01",
    recruiterContact: "",
    applicationUrl: "/jobs/data-analyst-delhi",
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    status: "active",
  },
  {
    id: "job-2",
    slug: "business-analyst-delhi",
    title: "Business Analyst",
    companyName: "Metric Works",
    companyLogo: "MW",
    description: "Translate reporting needs into dashboards.",
    responsibilities: [],
    requirements: [],
    skills: ["Excel", "Stakeholder Management", "Power BI"],
    salaryMin: 500000,
    salaryMax: 850000,
    salaryType: "yearly",
    location: "Delhi, Delhi",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    workMode: "onsite",
    experienceRequired: "2-4 years",
    educationRequired: "BBA",
    jobType: "full-time",
    industry: "Analytics",
    openings: 1,
    applicationDeadline: "2026-07-01",
    recruiterContact: "",
    applicationUrl: "/jobs/business-analyst-delhi",
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    status: "active",
  },
];

describe("salary calculator", () => {
  it("normalizes form input into calculator input", () => {
    expect(
      normalizeSalaryCalculatorInput({
        jobRole: " Data Analyst ",
        city: " Delhi ",
        experience: 2,
        skills: "SQL, Excel, SQL",
        education: " BCA ",
      }),
    ).toEqual({
      jobRole: "Data Analyst",
      city: "Delhi",
      experience: "2",
      skills: ["SQL", "Excel"],
      education: "BCA",
    });
  });

  it("prefers salary_data when rows are available", () => {
    const rows: SalaryDataRow[] = [
      {
        job_title: "Data Analyst",
        city: "Delhi",
        state: "Delhi",
        experience_range: "0-2 years",
        salary_min: 350000,
        salary_max: 550000,
        salary_type: "yearly",
        source: "internal",
      },
      {
        job_title: "Data Analyst",
        city: "Delhi",
        state: "Delhi",
        experience_range: "2-4 years",
        salary_min: 500000,
        salary_max: 750000,
        salary_type: "yearly",
        source: "internal",
      },
    ];

    const result = buildSalaryCalculatorResult({
      input: {
        jobRole: "Data Analyst",
        city: "Delhi",
        experience: "2",
        skills: ["SQL", "Excel"],
        education: "BCA",
      },
      rows,
      jobs,
    });

    expect(result.source).toBe("salary_data");
    expect(result.matchedSalaryRecords).toBe(2);
    expect(result.disclaimer).toBe(SALARY_DISCLAIMER);
    expect(result.expectedSalaryRange).toContain("INR");
    expect(result.suggestedJobs.length).toBeGreaterThan(0);
  });

  it("falls back to AI estimate when salary_data is missing", () => {
    const result = buildSalaryCalculatorResult({
      input: {
        jobRole: "Software Engineer",
        city: "Bengaluru",
        experience: "3",
        skills: ["React", "TypeScript"],
        education: "B.Tech",
      },
      rows: [],
      jobs,
      aiEstimate: {
        entry_level: "INR 4,00,000 / year",
        average: "INR 7,00,000 / year",
        high: "INR 12,00,000 / year",
        drivers: ["System Design", "Cloud", "TypeScript"],
        related_roles: ["Frontend Engineer", "Full Stack Developer"],
      },
    });

    expect(result.source).toBe("ai_estimate");
    expect(result.entryLevelSalary).toBe("INR 4,00,000 / year");
    expect(result.skillsThatIncreaseSalary).toContain("Cloud");
    expect(result.similarRoles).toContain("Frontend Engineer");
  });
});
