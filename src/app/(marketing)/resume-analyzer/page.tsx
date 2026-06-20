import { ResumeAnalyzer } from "@/components/resume";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Resume Analyzer",
  description:
    "Upload a resume, compare it with a job description, and get ATS score, missing keywords, and stronger bullet points.",
  path: "/resume-analyzer",
});

export default function ResumeAnalyzerPage() {
  return <ResumeAnalyzer />;
}
