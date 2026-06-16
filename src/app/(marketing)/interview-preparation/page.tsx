import { FeaturePage } from "@/components/shared/feature-page";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Interview Preparation",
  description:
    "Practice HR, technical, behavioral, fresher, and role-specific interviews with AI scoring and feedback.",
  path: "/interview-preparation",
});

export default function InterviewPreparationPage() {
  return (
    <FeaturePage
      eyebrow="Interview Preparation"
      title="Practice interviews with instant AI feedback"
      description="Users answer by text, receive scored feedback, and review better model answers with role-specific improvement advice."
      highlights={[
        "HR, technical, behavioral, and fresher modes",
        "Communication, technical, and confidence scoring",
        "Role-specific question generation",
        "Practice history in candidate dashboard",
      ]}
      ctaHref="/dashboard/interviews"
      ctaLabel="See interview history"
      secondaryHref="/career-agent"
      secondaryLabel="Ask AI career agent"
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Supported roles</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Data analyst, software developer, sales executive, customer support, digital marketing, accountant, banking fresher, teacher, BPO, and HR executive.
            </p>
          </div>
          <div className="space-y-4 rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Interview report
            </p>
            <p className="text-sm text-slate-300">
              Communication score, technical score, confidence score, weak areas, and suggested practice questions.
            </p>
          </div>
        </CardContent>
      </Card>
    </FeaturePage>
  );
}
