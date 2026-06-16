import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminGovernmentJobsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Government jobs"
      description="Manage official-source updates, notifications, admit cards, and results."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          This module should emphasize source attribution, review timestamps, and visible disclaimer controls.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
