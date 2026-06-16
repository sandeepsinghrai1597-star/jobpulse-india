import { FeaturePage } from "@/components/shared/feature-page";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Resume Analyzer",
  description:
    "Upload a resume, compare it with a job description, and get ATS score, missing keywords, and stronger bullet points.",
  path: "/resume-analyzer",
});

export default function ResumeAnalyzerPage() {
  return (
    <FeaturePage
      eyebrow="Resume Analyzer"
      title="Check ATS strength before you apply"
      description="Upload PDF or DOCX resumes, compare them against a target job, and receive structured guidance on score, keywords, formatting, and role match."
      highlights={[
        "ATS score out of 100",
        "Keyword and role match analysis",
        "Improved summary and bullet suggestions",
        "Optimized resume version generation",
      ]}
      ctaHref="/jobs"
      ctaLabel="Match to jobs"
      secondaryHref="/resume-builder"
      secondaryLabel="Build a better resume"
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-3">
          {[
            "Formatting and grammar review",
            "Missing skills and keywords",
            "Job description comparison",
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <p className="font-medium text-slate-50">{item}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Structured JSON output keeps the analysis easy to render in cards, reports, and exports.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </FeaturePage>
  );
}
