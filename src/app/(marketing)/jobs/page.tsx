import { searchUnifiedJobs } from "@/lib/jobs/search";
import { buildMetadata } from "@/lib/seo";
import { JobCard } from "@/components/jobs/job-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Latest Jobs in India",
  description:
    "Search fresher jobs, remote jobs, sales roles, software jobs, banking jobs, and internships across India.",
  path: "/jobs",
});

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtered = await searchUnifiedJobs({
    keyword: typeof params.keyword === "string" ? params.keyword : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    jobType: typeof params.jobType === "string" ? params.jobType : undefined,
    workMode: typeof params.workMode === "string" ? params.workMode : undefined,
    education: typeof params.education === "string" ? params.education : undefined,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Jobs Search Engine"
        title="Search jobs with filters designed for Indian candidates"
        description="Keyword, city, work mode, job type, and education filters are ready now, with PostgreSQL full-text search planned as the primary production search layer."
      />
      <Card className="mt-6 rounded-[1.5rem] border-cyan-200 bg-cyan-50/80">
        <CardContent className="p-5 text-sm leading-6 text-cyan-900">
          Live-source mode supports official imports first. If <code>ENABLE_LIVE_JOB_IMPORT=true</code> is set, this page merges public National Career Service opportunities with the local curated dataset.
        </CardContent>
      </Card>
      <Card className="mt-4 rounded-[1.5rem] border-emerald-200 bg-emerald-50/80">
        <CardContent className="p-5 text-sm leading-6 text-emerald-900">
          Applications now use verified candidate profiles. Job discovery is public, but applying is locked until a candidate profile is completed and verified.
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(params)
          .filter(([, value]) => typeof value === "string" && value.length > 0)
          .map(([key, value]) => (
            <Badge key={key} variant="secondary" className="rounded-full px-3 py-1">
              {key}: {value as string}
            </Badge>
          ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {filtered.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
