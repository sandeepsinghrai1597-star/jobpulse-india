import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function EmployerApplicantsPage() {
  return (
    <DashboardShell
      role="employer"
      title="Applicants"
      description="Review candidates, shortlist strong profiles, reject low-fit applicants, and download resumes."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Applicant views are modeled for candidate profile snapshots, status transitions, resume links, and employer notes.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
