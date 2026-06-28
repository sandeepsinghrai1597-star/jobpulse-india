import { ResumeAnalyzer } from "@/components/resume";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Resume ATS Analyzer | Check ATS Score & Fix Keywords - JobPulse India",
  description:
    "Upload your resume and get an ATS compatibility score, missing keywords, formatting feedback, and AI-suggested improvements in seconds.",
  path: "/resume-analyzer",
  keywords: ["resume ats analyzer", "ats score checker", "resume keyword checker", "resume analyzer india"],
});

export default function ResumeAnalyzerPage() {
  return <ResumeAnalyzer />;
}
