import Link from "next/link";
import { BriefcaseBusiness, Plus, Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { EmployerJobActions } from "@/components/employer/employer-job-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerDashboardData } from "@/lib/employer/dashboard";

function badge(status: string) {
  const tone: Record<string, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    draft: "border-slate-200 bg-slate-100 text-slate-800",
    rejected: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <Badge variant="outline" className={tone[status] ?? "border-slate-200 text-slate-700"}>
      {status === "draft" ? "paused" : status}
    </Badge>
  );
}

export default async function EmployerJobsPage() {
  const { jobs } = await getEmployerDashboardData();

  return (
    <DashboardShell
      role="employer"
      title="Manage jobs"
      description="Create, edit, pause, resume, delete, feature, and track each job post you own."
    >
      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-200 bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
            <BriefcaseBusiness className="size-5 text-primary" />
            Your job posts
          </CardTitle>
          <Button asChild>
            <Link href="/employer/jobs/new">
              <Plus className="size-4" />
              Post a job
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-950">{job.title}</h2>
                      {badge(job.status)}
                      {job.approval_status === "pending" ? badge("pending") : null}
                      {job.is_featured ? (
                        <Badge className="bg-indigo-600 text-white">
                          <Star className="size-3" />
                          Featured
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600">
                      {job.city || "City"} {job.state ? `, ${job.state}` : ""} - {job.openings} openings -{" "}
                      {job.work_mode ?? "work mode"} - {job.job_type ?? "job type"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Salary {job.salary_min ?? 0} - {job.salary_max ?? 0} - Deadline {job.deadline || "not set"}
                    </p>
                  </div>
                  <EmployerJobActions jobId={job.id} status={job.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="font-semibold text-slate-900">No jobs posted yet</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Post a job to start collecting verified applications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
