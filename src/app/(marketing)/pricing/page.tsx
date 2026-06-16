import { pricingPlans } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Candidate and employer plans for AI career guidance, resume tools, job posting, featured listings, and analytics.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Pricing"
        title="Monetization designed around value, not clutter"
        description="Candidate Pro unlocks deeper AI and resume tools, while employer plans focus on posts, analytics, and applicant workflows."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`rounded-[1.75rem] border-white/10 ${
              plan.highlighted ? "bg-slate-950 text-white" : "bg-white/5 text-slate-50 backdrop-blur"
            }`}
          >
            <CardContent className="space-y-5 p-6">
              {plan.highlighted ? <Badge className="rounded-full">Most popular</Badge> : null}
              <div>
                <h2 className="font-heading text-2xl font-semibold">{plan.name}</h2>
                <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? "text-slate-300" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{plan.price}</p>
              <ul className={`space-y-2 text-sm ${plan.highlighted ? "text-slate-200" : "text-muted-foreground"}`}>
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button className="w-full rounded-full" variant={plan.highlighted ? "secondary" : "default"}>
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
