import Link from "next/link";
import { careerGuides } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Career Guides",
  description:
    "Explore role-based learning roadmaps and career paths for high-interest jobs in India.",
  path: "/career-guide",
});

export default function CareerGuideIndexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Career Guides"
        title="Roadmaps for roles candidates want to grow into"
        description="These guide pages support both users and SEO by pairing job discovery with skill-building content."
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {careerGuides.map((guide) => (
          <Link key={guide.slug} href={`/career-guide/${guide.slug}`}>
            <Card className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur transition hover:border-primary/30">
              <CardContent className="space-y-3 p-6">
                <h2 className="font-heading text-2xl font-semibold">{guide.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{guide.summary}</p>
                <p className="text-sm font-medium text-primary">{guide.duration} roadmap</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
