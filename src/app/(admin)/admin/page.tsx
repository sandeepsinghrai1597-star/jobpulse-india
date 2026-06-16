import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="admin"
      title="Admin dashboard"
      description="Moderate jobs, recruiters, SEO pages, blog content, government updates, and payment visibility."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Admin tools are organized around moderation, trust, SEO operations, monetization, and analytics review.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
