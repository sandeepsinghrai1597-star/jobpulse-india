import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { jobs } from "@/lib/data/site";
import { JobCard } from "@/components/jobs/job-card";

export default function EmployerJobsPage() {
  return (
    <DashboardShell
      role="employer"
      title="Manage jobs"
      description="Create, edit, feature, expire, and track the performance of each job post."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {jobs.slice(0, 2).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </DashboardShell>
  );
}
