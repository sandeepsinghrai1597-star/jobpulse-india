import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingCard({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white backdrop-blur">
      <CardHeader className="flex flex-row items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CandidateDashboardLoading() {
  return (
    <DashboardShell
      role="candidate"
      title="Candidate dashboard"
      description="Loading profile strength, resumes, applications, saved jobs, alerts, and AI career tools."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <LoadingCard rows={2} />
          <LoadingCard rows={3} />
          <div className="grid gap-6 lg:grid-cols-2">
            <LoadingCard rows={2} />
            <LoadingCard rows={2} />
          </div>
        </div>
        <div className="space-y-6">
          <LoadingCard rows={2} />
          <LoadingCard rows={1} />
          <LoadingCard rows={1} />
          <LoadingCard rows={2} />
        </div>
      </div>
    </DashboardShell>
  );
}

