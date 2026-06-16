import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPaymentsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Payments"
      description="Monitor plans, featured listings, webhook status, and subscription health."
    >
      <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/70 backdrop-blur">
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Razorpay events, subscription entitlements, and payment records should be audited through secure server routes only.
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
