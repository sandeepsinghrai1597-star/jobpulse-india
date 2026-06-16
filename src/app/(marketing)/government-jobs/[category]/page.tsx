import { notFound } from "next/navigation";
import { governmentJobs } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return buildMetadata({
    title: `${category.toUpperCase()} Government Jobs`,
    description: `Latest ${category} government jobs, official links, last dates, and eligibility details.`,
    path: `/government-jobs/${category}`,
  });
}

export default async function GovernmentCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const items = governmentJobs.filter((job) => job.category === category);
  if (!items.length) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        {category.toUpperCase()} Government Jobs
      </h1>
      <div className="mt-8 space-y-6">
        {items.map((job) => (
          <Card key={job.id} className="rounded-[1.75rem] border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-2xl font-semibold">{job.title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{job.summary}</p>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Official site: {job.officialUrl}</p>
                <p>Notification: {job.notificationUrl}</p>
                <p>State: {job.state}</p>
                <p>Last date: {job.lastDate}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
