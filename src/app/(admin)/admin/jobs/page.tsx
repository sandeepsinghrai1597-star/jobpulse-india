import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminJobsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Job moderation"
      description="Approve, reject, verify, feature, or flag suspicious job posts."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Suspicious jobs, spam reports, and verification states should live in moderation-friendly tables and admin-only views.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
