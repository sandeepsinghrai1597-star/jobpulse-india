import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBlogPage() {
  return (
    <DashboardShell
      role="admin"
      title="Blog management"
      description="Create, edit, publish, and optimize articles for ranking and internal linking."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Blog management is modeled for draft/published states, metadata, schema type, and link strategy.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
