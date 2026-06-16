import { FeaturePage } from "@/components/shared/feature-page";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Resume Builder",
  description:
    "Create ATS-friendly resumes for fresher, internship, IT, sales, banking, and experienced roles.",
  path: "/resume-builder",
});

export default function ResumeBuilderPage() {
  return (
    <FeaturePage
      eyebrow="Resume Builder"
      title="Build role-specific resumes that recruiters can scan fast"
      description="The resume builder is structured around ATS-safe sections, reusable templates, JSON storage, and server-side export boundaries for PDF and DOCX generation."
      highlights={[
        "Fresher, IT, sales, banking, internship, and experienced templates",
        "AI-assisted summary and bullet generation",
        "Save, edit, duplicate, and export flow",
        "Supabase Storage and metadata persistence ready",
      ]}
      ctaHref="/resume-analyzer"
      ctaLabel="Analyze a Resume"
      secondaryHref="/dashboard/resumes"
      secondaryLabel="Open dashboard"
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Resume sections</h2>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              <li>• Contact details, summary, education, skills, and projects</li>
              <li>• Experience, achievements, certifications, and languages</li>
              <li>• AI-generated objective for target role</li>
              <li>• Structured JSON storage for editing and template switching</li>
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Export pipeline
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              PDF export is the first-class output. DOCX support is scaffolded as a next-step server utility without blocking the core resume workflow.
            </p>
          </div>
        </CardContent>
      </Card>
    </FeaturePage>
  );
}
