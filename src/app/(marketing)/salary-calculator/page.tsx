import { FeaturePage } from "@/components/shared/feature-page";
import { Card, CardContent } from "@/components/ui/card";
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
      description="The salary calculator combines role, city, experience, education, and skill signals to explain a likely entry-level, average, and high-end salary band."
      highlights={[
        "Entry-level, average, and high salary outputs",
        "Skills that tend to increase pay",
        "Related roles for broader targeting",
        "Clear disclaimer for market variability",
      ]}
      ctaHref="/career-agent"
      ctaLabel="Ask AI salary guidance"
      secondaryHref="/jobs"
      secondaryLabel="Browse jobs"
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-heading text-2xl font-semibold">Salary estimate disclaimer</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Salary estimates are approximate and may vary by company, city, skill depth, interview performance, and market conditions.
          </p>
        </CardContent>
      </Card>
    </FeaturePage>
  );
}
