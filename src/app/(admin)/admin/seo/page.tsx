import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSeoPage() {
  return (
    <DashboardShell
      role="admin"
      title="SEO operations"
      description="Manage city pages, category pages, indexing, schema coverage, and sitemap updates."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          SEO pages should remain curated and indexable only when they carry unique value, listings, internal links, and FAQs.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
