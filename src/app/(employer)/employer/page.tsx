import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Crown,
  FileSearch,
  Plus,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { ApplicantActions } from "@/components/employer/applicant-actions";
import { EmployerJobActions } from "@/components/employer/employer-job-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerDashboardData, getEmployerStats } from "@/lib/employer/dashboard";
import { buildResumeDownloadHref } from "@/lib/resumes/storage";

const pipelineStages = ["applied", "viewed", "shortlisted", "interview", "offered", "rejected"];

function statusBadge(status: string) {
  const classes: Record<string, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    draft: "border-slate-200 bg-slate-100 text-slate-800",
    rejected: "border-red-200 bg-red-50 text-red-800",
    shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-800",
    applied: "border-sky-200 bg-sky-50 text-sky-800",
    viewed: "border-violet-200 bg-violet-50 text-violet-800",
    interview: "border-cyan-200 bg-cyan-50 text-cyan-800",
    offered: "border-teal-200 bg-teal-50 text-teal-800",
  };

  return (
    <Badge variant="outline" className={classes[status] ?? "border-slate-200 bg-white text-slate-700"}>
      {status === "draft" ? "paused" : status}
    </Badge>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string | number;
  note: string;
  tone: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className={`h-1.5 ${tone}`} />
        <div className="p-5">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function EmployerDashboardPage() {
  const { profile, jobs, applications, payments } = await getEmployerDashboardData();
  const stats = getEmployerStats(jobs, applications);
  const latestPlan = payments[0];

  return (
    <DashboardShell
      role="employer"
      title="Employer dashboard"
      description="Manage your company profile, job posts, applicants, analytics, featured jobs, and subscription from one clear workspace."
    >
      {!profile ? (
        <Card className="rounded-lg border-amber-200 bg-amber-50 text-amber-950 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Complete your company profile first</p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Job posting and applicant management unlock after your employer profile exists.
              </p>
            </div>
            <Button asChild>
              <Link href="/employer/profile">
                <Building2 className="size-4" />
                Company profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active jobs" value={stats.activeJobs} note={`${stats.pendingJobs} pending approval`} tone="bg-emerald-500" />
        <MetricCard label="Applicants" value={stats.applicants} note={`${stats.shortlisted} shortlisted`} tone="bg-sky-500" />
        <MetricCard label="Apply rate" value={`${stats.applyRate}%`} note={`${stats.viewsEstimate} estimated views`} tone="bg-violet-500" />
        <MetricCard label="Featured jobs" value={stats.featuredJobs} note="Boost high-priority roles" tone="bg-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <ClipboardList className="size-5 text-primary" />
                Manage jobs
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
                jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-slate-950">{job.title}</h2>
                          {statusBadge(job.status)}
                          {job.approval_status === "pending" ? statusBadge("pending") : null}
                          {job.is_featured ? (
                            <Badge className="bg-indigo-600 text-white">
                              <Star className="size-3" />
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {job.city || "City"} {job.state ? `, ${job.state}` : ""} - {job.openings} openings -
                          deadline {job.deadline || "not set"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Salary {job.salary_min ?? 0} - {job.salary_max ?? 0} - {job.work_mode ?? "mode"} -{" "}
                          {job.job_type ?? "type"}
                        </p>
                      </div>
                      <EmployerJobActions jobId={job.id} status={job.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
                  <p className="font-semibold text-slate-900">No jobs yet</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Create your first job post. It will stay pending until approved unless admin approval is disabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <UsersRound className="size-5 text-primary" />
                Applicant pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pipelineStages.map((stage) => (
                  <div key={stage} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-semibold text-slate-950">
                      {applications.filter((application) => application.status === stage).length}
                    </p>
                    <div className="mt-2">{statusBadge(stage)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {applications.slice(0, 4).map((application) => {
                  const candidate = application.candidate_profiles;
                  return (
                    <div key={application.id} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950">
                              {candidate?.full_name || "Candidate"}
                            </p>
                            {statusBadge(application.status)}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {candidate?.headline || application.jobs?.title || "Applicant"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {candidate?.city || "City"} {candidate?.state ? `, ${candidate.state}` : ""}
                          </p>
                        </div>
                        <ApplicantActions
                          applicationId={application.id}
                          resumeHref={
                            application.resume_storage_path || application.resume_id
                              ? buildResumeDownloadHref({ applicationId: application.id })
                              : null
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <ShieldCheck className="size-5 text-primary" />
                Company profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-lg font-semibold text-slate-950">{profile?.company_name ?? "Company"}</p>
                <p className="text-sm leading-6 text-slate-600">
                  {profile?.industry || "Industry not set"} - {profile?.city || "City"}{" "}
                  {profile?.state ? `, ${profile.state}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusBadge(profile?.approval_status ?? "pending")}
                <Badge variant="outline" className="border-slate-200 text-slate-700">
                  {profile?.verified ? "verified" : "verification pending"}
                </Badge>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/employer/profile">
                  <Building2 className="size-4" />
                  Update company profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-indigo-200 bg-indigo-50 text-indigo-950 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="size-5" />
                Featured job CTA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-indigo-800">
                Highlight urgent openings to increase visibility in job search and employer campaigns.
              </p>
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade or buy featured job</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <Crown className="size-5 text-primary" />
                Subscription status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-950">
                  {latestPlan?.plan || "Employer Free"}
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Status: {latestPlan?.status || "active"} - Resume downloads and analytics available.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">Manage plan</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <BarChart3 className="size-5 text-primary" />
                Job analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-slate-600">Shortlist rate</p>
              <p className="text-3xl font-semibold text-slate-950">{stats.shortlistRate}%</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/employer/analytics">View analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <FileSearch className="size-5 text-primary" />
                Resume access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <p className="text-sm leading-6 text-slate-600">
                Download resumes from applicant cards and keep the pipeline updated after screening.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="size-4" />
                Applicant tools enabled
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
