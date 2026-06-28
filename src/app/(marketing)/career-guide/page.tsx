import Link from "next/link";
import { careerGuides } from "@/lib/data/learning-roadmaps";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Career Guides",
  description:
    "Explore role-based learning roadmaps, salary ranges, skills, projects, and job paths for high-interest careers in India.",
  path: "/career-guide",
});

export default function CareerGuideIndexPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Career Guides"
        title="Roadmaps for the roles candidates actually want"
        description="Each guide combines a role overview, salary expectations, skill stack, project ideas, learning resources, and a 30-day plus 90-day plan."
        as="h1"
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {careerGuides.map((guide) => (
          <Link key={guide.slug} href={`/career-guide/${guide.slug}`}>
            <Card className="h-full rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-sky-700">
                    {guide.duration}
                  </Badge>
                  <h2 className="font-heading text-2xl font-semibold text-slate-950">{guide.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{guide.summary}</p>
                </div>
                <p className="text-sm font-medium text-slate-800">{guide.salaryRange}</p>
                <div className="flex flex-wrap gap-2">
                  {guide.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="rounded-full border-slate-300 text-slate-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
