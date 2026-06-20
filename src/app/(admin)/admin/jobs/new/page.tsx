import { DashboardShell } from "@/components/dashboards/dashboard-shell";
import { AdminJobCreateForm } from "@/components/admin/admin-job-create-form";

export default function AdminNewJobPage() {
  return (
    <DashboardShell
      role="admin"
      title="Create admin job"
      description="Add a new moderated listing, create or update the linked company record, and send the job into the pending review queue."
    >
      <AdminJobCreateForm />
    </DashboardShell>
  );
}
