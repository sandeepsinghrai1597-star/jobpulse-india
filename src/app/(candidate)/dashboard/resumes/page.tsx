import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CandidateResumesPage() {
  return (
    <DashboardShell
      role="candidate"
      title="Resume library"
      description="Manage uploaded resumes, created resumes, ATS scores, and export/download actions."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Resume storage is modeled for uploaded files, generated files, ATS scores, and template versions.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
