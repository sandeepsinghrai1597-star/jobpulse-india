import { SalaryCalculator } from "@/components/marketing/salary-calculator";
import { FeaturePage } from "@/components/shared/feature-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Salary Calculator",
  description:
    "Estimate salary ranges by role, city, experience, skills, and education for Indian job seekers.",
  path: "/salary-calculator",
});

export default function SalaryCalculatorPage() {
  return (
    <FeaturePage
      eyebrow="Salary Calculator"
      title="Estimate role and city-based salary ranges more responsibly"
      description="Compare expected salary range, entry-level pay, average salary, high salary, market-driving skills, similar roles, and suggested jobs in one flow."
      highlights={[
        "Uses salary_data when matching records are available",
        "Falls back to AI estimate with a clear disclaimer",
        "Shows entry-level, average, and high salary views",
        "Suggests related roles and active jobs to target next",
      ]}
      ctaHref="/jobs"
      ctaLabel="Browse jobs"
      secondaryHref="/career-agent"
      secondaryLabel="Ask career agent"
    >
      <SalaryCalculator />
    </FeaturePage>
  );
}
