import { JobCard } from "@/components/jobs/job-card";
import { searchUnifiedJobs } from "@/lib/jobs/search";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Remote Jobs - Work From Home",
  description: "Remote and work-from-home jobs across India.",
  path: "/remote-jobs",
});

export default async function RemoteJobs() {
  const jobs = await searchUnifiedJobs({ workMode: "remote" });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Remote Jobs</h1>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
