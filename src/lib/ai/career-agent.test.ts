jest.mock("@/lib/ai/gemini", () => ({
  generateStructuredAiResponse: jest.fn(),
}));

import {
  buildCareerAgentResponse,
  sanitizeMatchingJobs,
  type CareerAgentContext,
  type CareerAgentJob,
} from "@/lib/ai/career-agent";

const completeContext: CareerAgentContext = {
  education: "BCA",
  skills: ["Excel", "SQL"],
  city: "Delhi",
  experience: "0-1 years",
  preferredRole: "Data Analyst",
  salaryExpectation: "400000",
  resumeText: "",
  notes: "",
};

const jobs: CareerAgentJob[] = [
  {
    id: "job-1",
    slug: "data-analyst-delhi",
    title: "Data Analyst",
    company_name: "Insight Ladder",
    description: "Analyze data with SQL and Excel.",
    skills: ["SQL", "Excel"],
    city: "Delhi",
    salary_min: 300000,
    salary_max: 500000,
  },
];

describe("career agent", () => {
  it("asks for missing context without calling Gemini", async () => {
    const generate = jest.fn();

    const result = await buildCareerAgentResponse({
      context: { ...completeContext, education: "", skills: [] },
      messages: [],
      jobs,
      generate,
    });

    expect(result.type).toBe("needs_context");
    expect(generate).not.toHaveBeenCalled();
    if (result.type === "needs_context") {
      expect(result.missing_context).toEqual(["education", "skills"]);
    }
  });

  it("removes Gemini job recommendations that are not in the database shortlist", () => {
    const result = sanitizeMatchingJobs(
      [
        { id: "job-1", match_reason: "Strong SQL overlap." },
        { id: "fake-job", match_reason: "Invented opening." },
      ],
      jobs,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "job-1",
      title: "Data Analyst",
      match_reason: "Strong SQL overlap.",
    });
  });

  it("returns no matching jobs when the database has no approved active jobs", async () => {
    const generate = jest.fn(async () => ({
      summary: "Focus on data analyst roles.",
      best_roles: ["Data Analyst"],
      matching_jobs: [{ id: "fake-job", match_reason: "Not real." }],
      missing_skills: ["Power BI"],
      salary_expectation: "Compare against Delhi fresher ranges.",
      learning_roadmap: ["Week 1: SQL"],
      next_7_days_action_plan: ["Day 1: Update resume"],
      disclaimer: "No placement is guaranteed.",
    }));

    const result = await buildCareerAgentResponse({
      context: completeContext,
      messages: [],
      jobs: [],
      generate,
    });

    expect(result.type).toBe("career_agent_result");
    if (result.type === "career_agent_result") {
      expect(result.matching_jobs).toEqual([]);
      expect(result.disclaimer).toContain("guaranteed");
    }
  });
});
