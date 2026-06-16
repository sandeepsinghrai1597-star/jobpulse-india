import { Card, CardContent } from "@/components/ui/card";
import { FeaturePage } from "@/components/shared/feature-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Career Agent",
  description:
    "Get AI job recommendations, skill-gap analysis, salary guidance, and a 7-day action plan.",
  path: "/career-agent",
});

export default function CareerAgentPage() {
  return (
    <FeaturePage
      eyebrow="AI Career Agent"
      title="Guided AI career support for Indian job seekers"
      description="The career agent asks about your education, skills, city, salary, and language preference before returning structured guidance you can actually act on."
      highlights={[
        "Suitable roles with why-they-fit reasoning",
        "Skill gap analysis against your target role",
        "Salary guidance with clear disclaimers",
        "7-day action plan and learning roadmap",
      ]}
      ctaHref="/pricing"
      ctaLabel="Unlock Pro AI"
      secondaryHref="/jobs"
      secondaryLabel="Browse jobs"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-heading text-2xl font-semibold">Structured AI output</h2>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-cyan-200">
{`{
  "summary": "Good fit for junior data and support roles",
  "best_roles": ["Data Analyst", "MIS Executive"],
  "skills_to_improve": ["Power BI", "Advanced Excel"],
  "jobs_to_apply": ["Junior Data Analyst - Delhi"],
  "action_plan_7_days": ["Update resume", "Apply to 10 roles"]
}`}
            </pre>
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-heading text-2xl font-semibold">Safety guardrails</h2>
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>• No fake job openings or guaranteed selection claims.</li>
              <li>• Salary ranges are guidance only and clearly labeled as approximate.</li>
              <li>• Missing profile details are requested before advice is generated.</li>
              <li>• Future production AI calls are rate-limited and server-only.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </FeaturePage>
  );
}
