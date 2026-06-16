import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerAnalyticsPage() {
  return (
    <DashboardShell
      role="employer"
      title="Hiring analytics"
      description="Track job views, applications, apply rate, and shortlist conversion."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          The analytics layer is prepared for internal event tracking, job-level metrics, and premium plan reporting.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
