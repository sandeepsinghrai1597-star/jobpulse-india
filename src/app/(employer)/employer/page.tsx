import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerDashboardPage() {
  return (
    <DashboardShell
      role="employer"
      title="Employer dashboard"
      description="Manage company profile, job posts, applicants, featured listings, and analytics."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Employer workflows are designed for verified recruiters, plan-based job limits, applicant review, and resume access with role-based controls.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
