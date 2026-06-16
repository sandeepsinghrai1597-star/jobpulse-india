import { notFound } from "next/navigation";
import { jobs, seoPages } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { JobCard } from "@/components/jobs/job-card";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = seoPages.find((item) => item.slug === slug);
  if (!page) return {};

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
  });
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = seoPages.find((item) => item.slug === slug);
  if (!page) notFound();

  const relatedJobs = page.city
    ? jobs.filter((job) => job.city.toLowerCase() === page.city?.toLowerCase())
    : jobs;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-8">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">{page.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
          {page.description}
        </p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {relatedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <Card className="mt-8 rounded-[2rem] border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="space-y-3 p-8">
          <h2 className="font-heading text-2xl font-semibold">FAQs</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This section is ready for schema-backed FAQs, related cities, categories, and internal links for controlled indexing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
