import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { AdminJobsImportPage } from "@/components/admin/admin-jobs-import-page";

export default function AdminJobsImportRoute() {
  return (
    <DashboardShell
      role="admin"
      title="Import jobs from CSV"
      description="Validate a bulk jobs file, inspect row-level issues, and send only clean listings into the pending review queue."
    >
      <AdminJobsImportPage />
    </DashboardShell>
  );
}
