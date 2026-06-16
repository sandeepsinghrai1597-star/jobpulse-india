import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function EditEmployerJobPage() {
  return (
    <DashboardShell
      role="employer"
      title="Edit job"
      description="Update active jobs, mark them featured, and keep content aligned with policy and SEO."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Edit flows should be backed by server actions or route handlers with role checks and audit-friendly timestamps.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
