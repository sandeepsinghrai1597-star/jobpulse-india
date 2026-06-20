import { BarChart3, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployerAnalytics } from "@/lib/employer/dashboard";

export default async function EmployerAnalyticsPage() {
  const analytics = await getEmployerAnalytics();

  return (
    <DashboardShell
      role="employer"
      title="Hiring analytics"
      description="Review real job views, applications, conversion, and applicant trends across your openings."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active jobs", analytics.activeJobs, "Currently live openings"],
          ["Job views", analytics.totalViews, "Tracked from job detail pages"],
          ["Applications", analytics.totalApplications, "Across your posted jobs"],
          ["Apply rate", `${analytics.applyRate}%`, "Applications divided by views"],
        ].map(([label, value, note]) => (
          <Card key={label} className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
              <BarChart3 className="size-5 text-primary" />
              Job performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {analytics.jobs.length > 0 ? (
              analytics.jobs.map((job) => (
                <div key={job.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-950">{job.title}</h2>
                        {job.is_featured ? <Badge className="bg-indigo-600 text-white">Featured</Badge> : null}
                      </div>
                      <p className="text-sm text-slate-600">
                        {job.views} views - {job.applications} applications - {job.applyRate}% apply rate
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {job.applicantLocations.length > 0 ? (
                          job.applicantLocations.map((location) => (
                            <Badge key={`${job.id}-${location}`} variant="outline">
                              {location}
                            </Badge>
                          ))
                        ) : (
                          <span>No applicant locations yet</span>
                        )}
                      </div>
                    </div>
                    <div className="flex max-w-sm flex-wrap gap-2">
                      {job.applicantSkills.length > 0 ? (
                        job.applicantSkills.map((skill) => (
                          <Badge key={`${job.id}-${skill}`} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                          <TrendingUp className="size-4" />
                          Skills will appear after applications arrive
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
                <p className="font-semibold text-slate-900">No analytics yet</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Analytics will populate after you publish jobs and candidates start viewing them.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <MapPin className="size-5 text-primary" />
                Applicant locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              {analytics.applicantLocations.length > 0 ? (
                analytics.applicantLocations.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Locations will appear once applications start coming in.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                <Sparkles className="size-5 text-primary" />
                Applicant skills
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-5">
              {analytics.applicantSkills.length > 0 ? (
                analytics.applicantSkills.map((item) => (
                  <Badge key={item.label} variant="secondary" className="rounded-full">
                    {item.label} ({item.count})
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">Top applicant skills will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
