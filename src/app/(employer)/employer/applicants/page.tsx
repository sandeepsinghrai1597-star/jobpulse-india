import { UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { ApplicantActions } from "@/components/employer/applicant-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerDashboardData } from "@/lib/employer/dashboard";
import { buildResumeDownloadHref } from "@/lib/resumes/storage";

const stages = ["applied", "viewed", "shortlisted", "interview", "offered", "rejected"];

function stageBadge(status: string) {
  const colors: Record<string, string> = {
    applied: "border-sky-200 bg-sky-50 text-sky-800",
    viewed: "border-violet-200 bg-violet-50 text-violet-800",
    shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-800",
    interview: "border-cyan-200 bg-cyan-50 text-cyan-800",
    offered: "border-teal-200 bg-teal-50 text-teal-800",
    rejected: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <Badge variant="outline" className={colors[status] ?? "border-slate-200 text-slate-700"}>
      {status}
    </Badge>
  );
}

export default async function EmployerApplicantsPage() {
  const { applications } = await getEmployerDashboardData();

  return (
    <DashboardShell
      role="employer"
      title="Applicants"
      description="Review candidates, shortlist strong profiles, reject low-fit applicants, and download resumes."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stages.map((stage) => (
          <Card key={stage} className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-semibold text-slate-950">
                {applications.filter((application) => application.status === stage).length}
              </p>
              <div className="mt-2">{stageBadge(stage)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
            <UsersRound className="size-5 text-primary" />
            Applicant pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {applications.length > 0 ? (
            applications.map((application) => {
              const candidate = application.candidate_profiles;
              const skills = candidate?.skills?.slice(0, 5) ?? [];

              return (
                <div key={application.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-950">
                          {candidate?.full_name || "Candidate"}
                        </h2>
                        {stageBadge(application.status)}
                      </div>
                      <p className="text-sm text-slate-700">
                        {candidate?.headline || application.jobs?.title || "Applicant"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Applied for {application.jobs?.title || "job"} - {candidate?.experience || "Experience not set"} -{" "}
                        {candidate?.education || "Education not set"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="border-slate-200 text-slate-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
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
            })
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
              <p className="font-semibold text-slate-900">No applicants yet</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Applicants will appear here after candidates apply to your jobs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
