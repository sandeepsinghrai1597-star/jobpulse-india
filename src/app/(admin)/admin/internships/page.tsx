import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminInternshipsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Internships"
      description="Manage internship listings, filters, stipend visibility, and employer quality."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Internship moderation can share core job review workflows while preserving stipend and duration-specific fields.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
