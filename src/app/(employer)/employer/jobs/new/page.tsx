import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { JobPostForm } from "@/components/employer/job-post-form";

export default function NewEmployerJobPage() {
  return (
    <DashboardShell
      role="employer"
      title="Post a job"
      description="Create an employer job listing with validation, role protection, and moderation-aware defaults."
    >
      <JobPostForm />
    </DashboardShell>
  );
}
