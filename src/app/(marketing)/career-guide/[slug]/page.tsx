import { notFound } from "next/navigation";
import { careerGuides } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = careerGuides.find((item) => item.slug === slug);
  if (!guide) {
    return buildMetadata({
      title: "Career guide not found",
      description: "The requested career guide could not be found.",
      path: `/career-guide/${slug}`,
    });
  }

  return buildMetadata({
    title: guide.title,
    description: guide.summary,
    path: `/career-guide/${guide.slug}`,
    keywords: guide.skills,
  });
}

export default async function CareerGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = careerGuides.find((item) => item.slug === slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">{guide.title}</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{guide.summary}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {guide.weeks.map((item) => (
          <Card key={item.week} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {item.week}
              </p>
              <h2 className="font-heading text-2xl font-semibold">{item.focus}</h2>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {item.outcomes.map((outcome) => (
                  <li key={outcome}>• {outcome}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
