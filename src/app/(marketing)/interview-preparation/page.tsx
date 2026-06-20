import { FeaturePage } from "@/components/shared/feature-page";
import { InterviewPreparation } from "@/components/ai/interview-preparation";
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
      secondaryHref="/ai-career-agent"
      secondaryLabel="Ask AI career agent"
    >
      <InterviewPreparation />
    </FeaturePage>
  );
}
